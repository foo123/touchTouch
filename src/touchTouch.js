/**
*  touchTouch.js
*  Enhanced Vanilla JavaScript version of https://github.com/tutorialzine/touchTouch Optimized Mobile Gallery by Martin Angelov
*  @VERSION: 1.4.0
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

function num(x)
{
    return parseFloat(x || 0) || 0;
}
function numbers(s)
{
    return (String(s).match(num_re) || []).map(num);
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
            get: function(){
                passiveSupported = true;
                return false;
            }
        });
        window.addEventListener('test', null, options);
        window.removeEventListener('test', null, options);
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
function closest(el, id)
{
    if (el.closest) return el.closest('#'+id);
    while (el)
    {
        if (id === el.id) return el;
        el = el.parentNode;
    }
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
        // Appending the markup to the page
        overlay = document.createElement('div');
        overlay.id = 'galleryOverlay';
        if ('ontouchstart' in window) addClass(overlay, 'is-touch-screen');
        hide(overlay);
    }
}
function showOverlay(instance)
{
    // If the overlay is already shown, exit
    if (overlayVisible) return false;
    // Raise the visible flag
    overlayVisible = true;
    activeInstance = instance;
    // Show the overlay
    document.body.appendChild(show(overlay));
    // listen for esc/left/right keys
    addEvent(window, 'keydown', keyListener, {passive:true, capture:false});
    // Trigger the opacity CSS transition
    setTimeout(function() {addClass(overlay, 'visible');}, 60);
}
function hideOverlay()
{
    // If the overlay is not shown, exit
    if (!overlayVisible) return false;
    overlayVisible = false;
    activeInstance = null;
    // unlisten for esc/left/right keys
    removeEvent(window, 'keydown', keyListener, {passive:true, capture:false});
    // Hide the overlay
    removeClass(hide(overlay), 'visible');
    setTimeout(function() {overlay.textContent = '';}, 0);
}
function loadImage(src, callback)
{
    var img = document.createElement('img');
    addEvent(img, 'load', function load() {
        removeEvent(img, 'load', load);
        addClass(img, img.height > img.width ? 'is-portrait' : (img.height === img.width ? 'is-square' : 'is-landscape'));
        callback.call(img);
    });
    img.src = src;
}
function fit(img, scale)
{
    if (!img || ('img' !== (img.tagName||'').toLowerCase())) return;
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
}

function touchTouch(items, options)
{
    var self = this;
    if (!(self instanceof touchTouch)) return new touchTouch(items, options);

    /* Private variables */
    var slider, prevArrow, nextArrow, placeholders,
        touchStart, touchMove, touchEnd, wheelTurn,
        prevClick, nextClick, itemClick, onResize, removeHandlers,
        index = 0, auto = false, fitscale = 0;

    options = options || {};
    auto = !!options.auto;
    fitscale = options.fit;
    setup();
    slider = document.createElement('div');
    prevArrow = document.createElement('a');
    nextArrow = document.createElement('a');
    slider.id = 'gallerySlider' + String(++id);
    slider.style.touchAction = 'none';
    addClass(slider, 'gallery-slider');
    if (options.slider) addClass(slider, options.slider);
    addClass(prevArrow, 'prev-arrow');
    if (options.prevArrow) addClass(prevArrow, options.prevArrow);
    addClass(nextArrow, 'next-arrow');
    if (options.nextArrow) addClass(nextArrow, options.nextArrow);

    items = Array.prototype.slice.call(items || []);

    // Creating a placeholder for each image
    placeholders = items.map(function(item, i) {
        var placeholder;
        placeholder = document.createElement('div');
        addClass(placeholder, 'placeholder');
        slider.appendChild(placeholder);
        return placeholder;
    });

    removeHandlers = function() {
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

    // touch/click/drag/wheel event handlers
    addEvent(slider, 'touchstart', touchStart = debounce(function(e) {
        var isTouch = e.touches && e.touches.length, el = e.target;

        if ('img' === el.tagName.toLowerCase())
        {
            if ((isTouch && (2 === e.touches.length) && (2 === e.targetTouches.length)) || (!isTouch && (e.ctrlKey || e.metaKey)))
            {
                removeHandlers();
                var touches = isTouch ? (e.touches[0].pageX <= e.touches[1].pageX ? [e.touches[0], e.touches[1]] : [e.touches[1], e.touches[0]]) : null,
                    start = isTouch ? [
                        touches[0].pageX, touches[0].pageY,
                        touches[1].pageX, touches[1].pageY
                    ] : [
                        e.pageX, e.pageY
                    ],
                    start0 = start,
                    img = el,
                    tX = numbers(img.style.getPropertyValue('margin-left'))[0] || 0,
                    tY = numbers(img.style.getPropertyValue('margin-top'))[0] || 0,
                    scale = numbers(img.style.getPropertyValue('transform')),
                    sX = scale[0] ? scale[0] : 1;
                addEvent(slider, isTouch ? 'touchmove' : 'mousemove', touchMove = function(e) {
                    e.preventDefault && e.preventDefault();

                    if (isTouch && ((2 !== e.touches.length) || (2 !== e.targetTouches.length))) return false;

                    var touches2 = isTouch ? [touches[0].identifier === e.touches[0].identifier ? e.touches[0] : (touches[0].identifier === e.touches[1].identifier ? e.touches[1] : null), touches[1].identifier === e.touches[0].identifier ? e.touches[0] : (touches[1].identifier === e.touches[1].identifier ? e.touches[1] : null)] : null;

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
                        a = (end[2] - end[0]) / (start0[2] - start0[0]) - 1;
                        nsX = stdMath.min(stdMath.max(sX + 0.1 * a, 1), 3);
                    }
                    else
                    {
                        ntX = tX + end[0] - start[0];
                        ntY = tY + end[1] - start[1];
                        nsX = sX;
                    }
                    start = end;
                    if (stdMath.abs(nsX - 1) < 1e-2)
                    {
                        tX = 0;
                        tY = 0;
                        sX = 1;
                        img.style.removeProperty('transform-origin');
                        img.style.removeProperty('transform');
                        img.style.removeProperty('margin-left');
                        img.style.removeProperty('margin-top');
                    }
                    else if (!isTouch)
                    {
                        tX = ntX;
                        tY = ntY;
                        img.style.marginLeft = String(tX)+'px';
                        img.style.marginTop = String(tY)+'px';
                    }
                    else if (stdMath.abs(a) < 0.5)
                    {
                        tX = ntX;
                        tY = ntY;
                        img.style.marginLeft = String(tX)+'px';
                        img.style.marginTop = String(tY)+'px';
                    }
                    else
                    {
                        sX = nsX;
                        img.style.transformOrigin = 'center center';
                        img.style.transform = 'scale('+sX+','+sX+')';
                    }
                    return false;
                }, {passive:false, capture:false});
                touchMove.isTouch = isTouch;
                touchEnd = debounce(removeHandlers, 200);
                if (isTouch)
                {
                    addEvent(slider, 'touchend', touchEnd, {passive:true, capture:false});
                    addEvent(slider, 'touchcancel', touchEnd, {passive:true, capture:false});
                    touchEnd.isTouch = isTouch;
                }
                else
                {
                    addEvent(slider, 'mouseup', touchEnd, {passive:true, capture:false});
                    touchEnd.isTouch = isTouch;
                }
            }
            else if (!isTouch || ((1 === e.touches.length) && (1 === e.targetTouches.length)))
            {
                removeHandlers();
                var startX = isTouch ? e.touches[0].pageX : e.pageX;
                addEvent(slider, isTouch ? 'touchmove' : 'mousemove', touchMove = function(e) {
                    e.preventDefault && e.preventDefault();

                    if (isTouch && ((1 !== e.touches.length) || (1 !== e.targetTouches.length))) return false;

                    var diff = (isTouch ? e.touches[0].pageX : e.pageX) - startX;

                    if (diff > 20)
                    {
                        removeHandlers();
                        self.showPrevious();
                    }
                    else if (diff < -20)
                    {
                        removeHandlers();
                        self.showNext();
                    }
                    return false;
                }, {passive:false, capture:false});
                touchMove.isTouch = isTouch;
                touchEnd = debounce(removeHandlers, 200);
                if (isTouch)
                {
                    addEvent(slider, 'touchend', touchEnd, {passive:true, capture:false});
                    addEvent(slider, 'touchcancel', touchEnd, {passive:true, capture:false});
                    touchEnd.isTouch = isTouch;
                }
                else
                {
                    addEvent(slider, 'mouseup', touchEnd, {passive:true, capture:false});
                    touchEnd.isTouch = isTouch;
                }
            }
        }
        else if (prevArrow !== el && nextArrow !== el)
        {
            removeHandlers();
            setTimeout(hideOverlay, 100);
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
            var img = e.target,
                scale = numbers(img.style.getPropertyValue('transform')),
                sX = scale[0] ? scale[0] : 1;
            sX = stdMath.min(stdMath.max(sX - e.deltaY * 1e-3, 1), 3);
            if (stdMath.abs(sX - 1) < 1e-2)
            {
                sX = 1;
                img.style.removeProperty('transform-origin');
                img.style.removeProperty('transform');
                img.style.removeProperty('margin');
            }
            else
            {
                img.style.transformOrigin = 'center center';
                img.style.transform = 'scale('+sX+','+sX+')';
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
            offsetSlider(index);
            showOverlay(self);
            showImage(index);
            // Preload the next image
            preload(index + 1);
            // Preload the previous
            preload(index - 1);
        }
    };

    var offsetSlider = function offsetSlider(index) {
        // This will trigger a smooth css transition
        slider.style.left = String(-index * 100) + '%';
    };

    // Preload an image by its index in the items array
    var preload = function preload(index) {
        // If the index is outside the bonds of the array
        if (index < 0 || index >= items.length) return false;
        setTimeout(function() {
            showImage(index);
        }, 1000);
    };

    // Show image in the slider
    var showImage = function showImage(index) {
        // If the index is outside the bonds of the array
        if (index < 0 || index >= items.length) return false;
        // Call the load function with the href attribute of the item
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
                addClass(placeholders[index], 'loaded');
                placeholders[index].appendChild(this);
            });
        }
    };

    self.showNext = function showNext() {
        if (activeInstance !== self) return;
        // If this is not the last image
        if (index + 1 < items.length)
        {
            ++index;
            offsetSlider(index);
            preload(index + 1);
        }
        else
        {
            // Trigger the spring animation
            addClass(slider, 'rightSpring');
            setTimeout(function() {removeClass(slider, 'rightSpring');}, 500);
        }
    };

    self.showPrevious = function showPrevious() {
        if (activeInstance !== self) return;
        // If this is not the first image
        if (index > 0)
        {
            --index;
            offsetSlider(index);
            preload(index - 1);
        }
        else
        {
            // Trigger the spring animation
            addClass(slider, 'leftSpring');
            setTimeout(function() {removeClass(slider, 'leftSpring');}, 500);
        }
    };

    self.dispose = function() {
        if (slider)
        {
            if (activeInstance === self) hideOverlay();
            if (onResize) removeEvent(window, 'resize', onResize, {passive:true, capture:false});
            removeHandlers();
            removeEvent(slider, 'touchstart', touchStart, {passive:false, capture:false});
            removeEvent(slider, 'mousedown', touchStart, {passive:false, capture:false});
            removeEvent(slider, 'wheel', wheelTurn, {passive:false, capture:false});
            removeEvent(prevArrow, 'click', prevClick, {passive:false, capture:false});
            removeEvent(nextArrow, 'click', nextClick, {passive:false, capture:false});
            if (!auto) items.forEach(function(item, i) {removeEvent(item, 'click', itemClick[i], {passive:false, capture:false});});
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
            self.showGallery = null;
            self.showNext = null;
            self.showPrevious = null;
        }
    };
}
touchTouch.VERSION = '1.4.0';
touchTouch.prototype = {
    constructor: touchTouch,
    dispose: null,
    showGallery: null,
    showNext: null,
    showPrevious: null
};
// export it
window.touchTouch = touchTouch;
})();