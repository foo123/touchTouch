/**
*  touchTouch.js
*  Enhanced Vanilla JavaScript version of https://github.com/tutorialzine/touchTouch Optimized Mobile Gallery by Martin Angelov
*  @VERSION: 1.5.0
*  @license: MIT License
*
*  https://github.com/foo123/touchTouch
*
**/
(function() {
"use strict";

var stdMath = Math,
    eventOptionsSupported = null,
    num_re = /(?:-?\d+(?:\.\d+)?)|(?:-?\.\d+)/g,
    trim_re = /^\s+|\s+$/g,
    trim = String.prototype.trim
        ? function(s) {return s.trim();}
        : function(s) {return s.replace(trim_re, '');}
;

function noop()
{
}
function num(x)
{
    return parseFloat(x || 0) || 0;
}
function numbers(s)
{
    return (String(s).match(num_re) || []).map(num);
}
function clamp(x, xmin, xmax)
{
    return stdMath.min(stdMath.max(x, xmin), xmax);
}
function debounce(f, wait, runThis)
{
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            f.apply(context, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (runThis) return runThis.apply(context, args);
    };
}
function hasEventOptions()
{
    var passiveSupported = false, options = {};
    try {
        Object.defineProperty(options, 'passive', {
            get: function() {
                passiveSupported = true;
                return false;
            }
        });
        window.addEventListener('test', noop, options);
        window.removeEventListener('test', noop, options);
    } catch(e) {
        passiveSupported = false;
    }
    return passiveSupported;
}
function addEvent(target, event, handler, options)
{
    if (null == eventOptionsSupported) eventOptionsSupported = hasEventOptions();
    if (target.attachEvent) target.attachEvent('on' + event, handler);
    else target.addEventListener(event, handler, eventOptionsSupported ? options : ('object' === typeof(options) ? !!options.capture : !!options));
    return target;
}
function removeEvent(target, event, handler, options)
{
    if (null == eventOptionsSupported) eventOptionsSupported = hasEventOptions();
    // if (el.removeEventListener) not working in IE11
    if (target.detachEvent) target.detachEvent('on' + event, handler);
    else target.removeEventListener(event, handler, eventOptionsSupported ? options : ('object' === typeof(options) ? !!options.capture : !!options));
    return target;
}
function addClass(el, className)
{
    if (el.classList) el.classList.add(className);
    else el.className = '' === el.className ? className : (el.className + ' ' + className);
    return el;
}
function removeClass(el, className)
{
    if (el.classList) el.classList.remove(className);
    else el.className = trim((' ' + el.className + ' ').replace(' ' + className + ' ', ' '));
    return el;
}
function hide(el)
{
    el.style.setProperty('--touchTouchDisplay', el.style.getPropertyValue('display'));
    el.style.display = 'none';
    return el;
}
function show(el)
{
    if ('none' === el.style.display)
        el.style.display = '' !== el.style.getPropertyValue('--touchTouchDisplay') ? el.style.getPropertyValue('--touchTouchDisplay') : 'block';
    return el;
}

/* Global private variables */
var activeInstance = null, overlay = null, overlayVisible = false, id = 0;

function keyListener(e)
{
    if (activeInstance)
    {
        if (27 === e.keyCode /*ESC*/) hideOverlay();
        else if (37 === e.keyCode /*LEFT*/) activeInstance.showPrevious();
        else if (39 === e.keyCode /*RIGHT*/) activeInstance.showNext();
    }
}
function setup()
{
    if (!overlay)
    {
        overlay = document.createElement('div');
        addClass(overlay, 'tt-gallery-overlay');
        if ('ontouchstart' in window) addClass(overlay, 'tt-touch-screen');
        hide(overlay);
    }
}
function showOverlay(instance)
{
    if (overlayVisible) return false;
    overlayVisible = true;
    activeInstance = instance;
    document.body.appendChild(show(overlay));
    addEvent(window, 'keydown', keyListener, {passive:true, capture:false});
    setTimeout(function() {addClass(overlay, 'tt-visible');}, 60);
}
function hideOverlay()
{
    if (!overlayVisible) return false;
    overlayVisible = false;
    activeInstance = null;
    removeEvent(window, 'keydown', keyListener, {passive:true, capture:false});
    removeClass(hide(overlay), 'tt-visible');
    setTimeout(function() {overlay.textContent = '';}, 0);
}
function offsetSlider(slider, index)
{
    // This will trigger a smooth css transition
    slider.style.left = String(-index * 100) + '%';
}
function loadImage(src, callback)
{
    var img = document.createElement('img');
    addEvent(img, 'load', function load() {
        removeEvent(img, 'load', load);
        addClass(img, img.height > img.width ? 'tt-portrait' : (img.height === img.width ? 'tt-square' : 'tt-landscape'));
        callback.call(img);
    });
    img.src = src;
}
function fit(img, scale)
{
    if (!img || ('img' !== (img.tagName||'').toLowerCase())) return img;
    var w = img.width,
        h = img.height,
        ww = scale*(window.innerWidth || document.documentElement.clientWidth),
        wh = scale*(window.innerHeight || document.documentElement.clientHeight);
    if (h * ww / w > wh)
    {
        img.style.height = String(wh) + 'px';
        img.style.width = 'auto';
    }
    else
    {
        img.style.width = String(ww) + 'px';
        img.style.height = 'auto';
    }
    return img;
}
function reset(img, tX, tY, sX, sY)
{
    if (img)
    {
        img.style.removeProperty('margin-left');
        img.style.removeProperty('margin-top');
        img.style.removeProperty('transform-origin');
        img.style.removeProperty('transform');
    }
    return img;
}
function translate(img, tX, tY)
{
    if (img)
    {
        img.style.marginLeft = String(tX) + 'px';
        img.style.marginTop = String(tY) + 'px';
    }
    return img;
}
function scale(img, sX, sY)
{
    if (img)
    {
        img.style.transformOrigin = 'center center';
        img.style.transform = 'scale(' + String(sX) + ',' + String(sX) + ')';
    }
    return img;
}
function translation(img)
{
    return [
        numbers(img.style.getPropertyValue('margin-left') || '')[0] || 0,
        numbers(img.style.getPropertyValue('margin-top') || '')[0] || 0
    ];
}
function scaling(img)
{
    return numbers(img.style.getPropertyValue('transform') || '');
}

function touchTouch(items, options)
{
    var self = this;
    if (!(self instanceof touchTouch)) return new touchTouch(items, options);

    /* Private variables */
    var slider, prevArrow, nextArrow, placeholders,
        touchStart, touchMove, touchEnd, wheelTurn,
        prevClick, nextClick, itemClick, onResize,
        showImage, preload, removeExtraHandlers,
        index = 0, auto = false, fitscale = 0;

    items = Array.prototype.slice.call(items || []);
    options = options || {};

    showImage = function showImage(index) {
        if (index < 0 || index >= items.length) return false;
        if (!placeholders[index].children.length)
        {
            loadImage(items[index].href, function() {
                if (fitscale)
                {
                    fit(this, fitscale);
                    if (!onResize)
                    {
                        addEvent(window, 'resize', onResize = debounce(function() {
                            placeholders.forEach(function(p) {fit(p.children[0], fitscale);});
                        }, 100), {passive:true, capture:false});
                    }
                }
                placeholders[index].textContent = '';
                addClass(placeholders[index], 'tt-img');
                placeholders[index].appendChild(this);
            });
        }
    };
    preload = function preload(index)  {
        if (index < 0 || index >= items.length) return false;
        setTimeout(function() {showImage(index);}, 1000);
    };
    removeExtraHandlers = function removeExtraHandlers() {
        if (touchMove)
        {
            removeEvent(slider, touchMove.isTouch ? 'touchmove' : 'mousemove', touchMove, {passive:false, capture:false});
        }
        if (touchEnd)
        {
            if (touchEnd.isTouch)
            {
                removeEvent(slider, 'touchend', touchEnd, {passive:true, capture:false});
                removeEvent(slider, 'touchcancel', touchEnd, {passive:true, capture:false});
            }
            else
            {
                removeEvent(slider, 'mouseup', touchEnd, {passive:true, capture:false});
            }
        }
        touchMove = null;
        touchEnd = null;
    };

    auto = !!options.auto;
    fitscale = options.fit;

    setup();

    slider = addClass(document.createElement('div'), 'tt-gallery-slider');
    if (options.slider) addClass(slider, options.slider);
    slider.id = 'tt-gallery-slider-' + String(++id);
    slider.style.setProperty('touch-action', 'none');
    slider.style.setProperty('-moz-transition-duration', String(options.swipe || 400) + 'ms');
    slider.style.setProperty('-webkit-transition-duration', String(options.swipe || 400) + 'ms');
    slider.style.setProperty('transition-duration', String(options.swipe || 400) + 'ms');

    prevArrow = addClass(document.createElement('a'), 'tt-prev-arrow');
    if (options.prevArrow) addClass(prevArrow, options.prevArrow);

    nextArrow = addClass(document.createElement('a'), 'tt-next-arrow');
    if (options.nextArrow) addClass(nextArrow, options.nextArrow);

    placeholders = items.map(function(item) {
        var placeholder;
        placeholder = document.createElement('div');
        addClass(placeholder, 'tt-placeholder');
        slider.appendChild(placeholder);
        return placeholder;
    });

    // event handlers
    // ignore superfluous touch events by debouncing
    addEvent(slider, 'touchstart', touchStart = debounce(function(e) {
        var isTouch = e.touches && e.touches.length, el = e.target;

        if ('img' === el.tagName.toLowerCase())
        {
            if ((isTouch && (2 === e.touches.length)) || (!isTouch && (e.ctrlKey || e.metaKey)))
            {
                removeExtraHandlers();
                var touches = isTouch ? (e.touches[0].pageX <= e.touches[1].pageX ? [e.touches[0], e.touches[1]] : [e.touches[1], e.touches[0]]) : null,
                    start = isTouch ? [
                        touches[0].pageX, touches[0].pageY,
                        touches[1].pageX, touches[1].pageY
                    ] : [
                        e.pageX, e.pageY
                    ],
                    img = el, t = translation(img), s = scaling(img),
                    tX = t[0], tY = t[1], sX = null != s[0] ? s[0] : 1;

                addEvent(slider, isTouch ? 'touchmove' : 'mousemove', touchMove = function(e) {
                    e.preventDefault && e.preventDefault();

                    // ignore superfluous touch events
                    if (isTouch && (2 !== e.touches.length)) return false;

                    var touches2 = isTouch ? [touches[0].identifier === e.touches[0].identifier ? e.touches[0] : (touches[0].identifier === e.touches[1].identifier ? e.touches[1] : null), touches[1].identifier === e.touches[0].identifier ? e.touches[0] : (touches[1].identifier === e.touches[1].identifier ? e.touches[1] : null)] : null;

                    // ignore superfluous touch events
                    if (isTouch && (!touches2[0] || !touches2[1])) return false;

                    var end = isTouch ? [
                            touches2[0].pageX, touches2[0].pageY,
                            touches2[1].pageX, touches2[1].pageY
                        ] : [
                            e.pageX, e.pageY
                        ], ntX, ntY, nsX, a;

                    if (isTouch)
                    {
                        ntX = tX + end[2] - start[2];
                        ntY = tY + end[3] - start[3];
                        a = stdMath.hypot(end[2] - end[0], end[3] - end[1]) / stdMath.hypot(start[2] - start[0], start[3] - start[1]) - 1;
                        nsX = clamp(sX + a * 4, 1, 3);
                    }
                    else
                    {
                        ntX = tX + end[0] - start[0];
                        ntY = tY + end[1] - start[1];
                        nsX = sX;
                    }
                    if (stdMath.abs(nsX - 1) < 1e-2)
                    {
                        reset(img, tX = 0, tY = 0, sX = 1);
                    }
                    else if (!isTouch)
                    {
                        translate(img, tX = ntX, tY = ntY);
                    }
                    else if (stdMath.abs(a) < 0.08)
                    {
                        translate(img, tX = ntX, tY = ntY);
                    }
                    else
                    {
                        scale(img, sX = nsX);
                    }
                    start = end;

                    return false;
                }, {passive:false, capture:false});
                touchMove.isTouch = isTouch;

                touchEnd = debounce(removeExtraHandlers, 200);
                if (isTouch)
                {
                    addEvent(slider, 'touchend', touchEnd, {passive:true, capture:false});
                    addEvent(slider, 'touchcancel', touchEnd, {passive:true, capture:false});
                }
                else
                {
                    addEvent(slider, 'mouseup', touchEnd, {passive:true, capture:false});
                }
                touchEnd.isTouch = isTouch;
            }
            else if (!isTouch || (1 === e.touches.length))
            {
                removeExtraHandlers();
                var touch = isTouch ? e.touches[0] : null, startX = isTouch ? touch.pageX : e.pageX;

                addEvent(slider, isTouch ? 'touchmove' : 'mousemove', touchMove = function(e) {
                    e.preventDefault && e.preventDefault();

                    // ignore superfluous touch events
                    if (isTouch && ((1 !== e.touches.length) || (touch.identifier !== e.touches[0].identifier))) return false;

                    var diff = (isTouch ? e.touches[0].pageX : e.pageX) - startX;

                    if (diff > 15)
                    {
                        self.showPrevious();
                    }
                    else if (diff < -15)
                    {
                        self.showNext();
                    }

                    return false;
                }, {passive:false, capture:false});
                touchMove.isTouch = isTouch;

                touchEnd = debounce(removeExtraHandlers, 200);
                if (isTouch)
                {
                    addEvent(slider, 'touchend', touchEnd, {passive:true, capture:false});
                    addEvent(slider, 'touchcancel', touchEnd, {passive:true, capture:false});
                }
                else
                {
                    addEvent(slider, 'mouseup', touchEnd, {passive:true, capture:false});
                }
                touchEnd.isTouch = isTouch;
            }
        }
        else if (prevArrow !== el && nextArrow !== el)
        {
            self.hideGallery();
        }
    }, 60, function(e) {
        e.preventDefault && e.preventDefault();
        return false;
    }), {passive:false, capture:false});

    addEvent(slider, 'mousedown', touchStart, {passive:false, capture:false});

    addEvent(slider, 'wheel', wheelTurn = function(e) {
        if (('img' === e.target.tagName.toLowerCase()) && (e.ctrlKey || e.metaKey))
        {
            e.preventDefault && e.preventDefault();
            var img = e.target, s = scaling(img), sX = null != s[0] ? s[0] : 1;
            sX = clamp(sX - e.deltaY * 1e-3, 1, 3);
            if (stdMath.abs(sX - 1) < 1e-2)
            {
                reset(img, 0, 0, sX = 1);
            }
            else
            {
                scale(img, sX);
            }
        }
    }, {passive:false, capture:false});

    addEvent(prevArrow, 'click', prevClick = function(e) {
        e.preventDefault && e.preventDefault();
        self.showPrevious();
    }, {passive:false, capture:false});

    addEvent(nextArrow, 'click', nextClick = function(e) {
        e.preventDefault && e.preventDefault();
        self.showNext();
    }, {passive:false, capture:false});

    if (!auto)
    {
        // Listening for clicks on the thumbnails
        itemClick = items.map(function(item, i) {
            var click;
            addEvent(item, 'click', click = function(e) {
                e.preventDefault && e.preventDefault();
                index = i;
                self.showGallery();
            }, {passive:false, capture:false});
            return click;
        });
    }

    self.showGallery = function showGallery() {
        if (activeInstance !== self)
        {
            // make up the dom structure
            overlay.textContent = '';
            overlay.appendChild(slider);
            overlay.appendChild(prevArrow);
            overlay.appendChild(nextArrow);
            // Move the slider to the correct image
            offsetSlider(slider, index);
            showOverlay(self);
            showImage(index);
            // Preload the next image
            preload(index + 1);
            // Preload the previous
            preload(index - 1);
        }
        return self;
    };

    self.hideGallery = function hideGallery() {
        if (activeInstance === self)
        {
            removeExtraHandlers();
            hideOverlay();
        }
        return self;
    };

    self.showNext = function showNext() {
        if (activeInstance !== self) return self;
        removeExtraHandlers();
        if (index + 1 < items.length)
        {
            var img = placeholders[index].children[0];
            setTimeout(function() {reset(img);}, 40);
            ++index;
            offsetSlider(slider, index);
            preload(index + 1);
        }
        else
        {
            addClass(slider, 'tt-right-spring');
            setTimeout(function() {removeClass(slider, 'tt-right-spring');}, 500);
        }
        return self;
    };

    self.showPrevious = function showPrevious() {
        if (activeInstance !== self) return self;
        removeExtraHandlers();
        if (index > 0)
        {
            var img = placeholders[index].children[0];
            setTimeout(function() {reset(img);}, 40);
            --index;
            offsetSlider(slider, index);
            preload(index - 1);
        }
        else
        {
            addClass(slider, 'tt-left-spring');
            setTimeout(function() {removeClass(slider, 'tt-left-spring');}, 500);
        }
        return self;
    };

    self.dispose = function() {
        if (slider)
        {
            removeExtraHandlers();
            if (activeInstance === self) hideOverlay();
            if (onResize) removeEvent(window, 'resize', onResize, {passive:true, capture:false});
            removeEvent(slider, 'touchstart', touchStart, {passive:false, capture:false});
            removeEvent(slider, 'mousedown', touchStart, {passive:false, capture:false});
            removeEvent(slider, 'wheel', wheelTurn, {passive:false, capture:false});
            removeEvent(prevArrow, 'click', prevClick, {passive:false, capture:false});
            removeEvent(nextArrow, 'click', nextClick, {passive:false, capture:false});
            if (itemClick) items.forEach(function(item, i) {removeEvent(item, 'click', itemClick[i], {passive:false, capture:false});});
            onResize = null;
            touchMove = null;
            touchStart = null;
            touchEnd = null;
            wheelTurn = null;
            prevClick = null;
            nextClick = null;
            itemClick = null;
            slider.textContent = '';
            slider = null;
            prevArrow = null;
            nextArrow = null;
            placeholders = null;
            items = null;
            options = null;
            self.showGallery = noop;
            self.hideGallery = noop;
            self.showNext = noop;
            self.showPrevious = noop;
        }
    };
}
touchTouch.VERSION = '1.5.0';
touchTouch.prototype = {
    constructor: touchTouch,
    dispose: noop,
    showGallery: noop,
    hideGallery: noop,
    showNext: noop,
    showPrevious: noop
};
// export it
window.touchTouch = touchTouch;
})();