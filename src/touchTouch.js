/**
*  touchTouch.js
*  Vanilla JavaScript version of https://github.com/tutorialzine/touchTouch Optimized Mobile Gallery by Martin Angelov
*  @VERSION: 1.1.0
*  @license: MIT License
*
*  https://github.com/foo123/touchTouch
*
**/
(function() {
"use strict";

var $ = '$tT', eventOptionsSupported = null,
    trim_re = /^\s+|\s+$/g,
    trim = String.prototype.trim
        ? function(s) {return s.trim();}
        : function(s) {return s.replace(trim_re, '');}
;

// add custom property to Element.prototype to avoid browser issues
if (
    window.Element
    && !Object.prototype.hasOwnProperty.call(window.Element.prototype, $)
)
    window.Element.prototype[$] = null;

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
}
function removeEvent(target, event, handler, options)
{
    if (null == eventOptionsSupported) eventOptionsSupported = hasEventOptions();
    // if (el.removeEventListener) not working in IE11
    if (target.detachEvent) target.detachEvent('on' + event, handler);
    else target.removeEventListener(event, handler, eventOptionsSupported ? options : ('object' === typeof(options) ? !!options.capture : !!options));
}
function addClass(el, className)
{
    if (el.classList) el.classList.add(className);
    else el.className = '' === el.className ? className : (el.className + ' ' + className);
}
function removeClass(el, className)
{
    if (el.classList) el.classList.remove(className);
    else el.className = trim((' ' + el.className + ' ').replace(' ' + className + ' ', ' '));
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
    el[$] = el[$] || {};
    el[$].display = el.style.getPropertyValue('display');
    if ('' === el[$].display) el[$].display = null;
    el.style.display = 'none';
    return el;
}
function show(el)
{
    if ('none' === el.style.display)
        el.style.display = el[$] && el[$].display ? el[$].display : 'block';
    return el;
}

/* Private variables */
var overlay = null, slider = null,
    prevArrow = null, nextArrow = null,
    overlayVisible = false, touchmove = null;

function setup()
{
    if (!overlay && !slider)
    {
        // Appending the markup to the page
        overlay = document.createElement('div');
        slider = document.createElement('div');
        prevArrow = document.createElement('a');
        nextArrow = document.createElement('a');
        overlay.id = 'galleryOverlay';
        slider.id = 'gallerySlider';
        prevArrow.id = 'prevArrow';
        nextArrow.id = 'nextArrow';
        if ('ontouchstart' in window) addClass(slider, 'is-touch-screen');
        document.body.appendChild(hide(overlay));
        overlay.appendChild(slider);
        overlay.appendChild(prevArrow);
        overlay.appendChild(nextArrow);
    }
}
function showOverlay(index)
{
    // If the overlay is already shown, exit
    if (overlayVisible) return false;
    // Show the overlay
    show(overlay);
    // Move the slider to the correct image
    offsetSlider(index);
    setTimeout(function() {
        // Trigger the opacity CSS transition
        addClass(overlay, 'visible');
    }, 0);
    // Raise the visible flag
    overlayVisible = true;
}
function hideOverlay()
{
    // If the overlay is not shown, exit
    if (!overlayVisible) return false;
    // Hide the overlay
    removeClass(hide(overlay), 'visible');
    overlayVisible = false;
}
function offsetSlider(index)
{
    // This will trigger a smooth css transition
    slider.style.left = String(-index * 100) + '%';
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

/* Creating the plugin */
function touchTouch(items)
{
    setup();

    var placeholders, index = 0;

    items = Array.prototype.slice.call(items || []);

    // Creating a placeholder for each image
    placeholders = items.map(function(item, i) {
        var placeholder;
        if (i >= slider.children.length)
        {
            placeholder = document.createElement('div');
            addClass(placeholder, 'placeholder');
            slider.appendChild(placeholder);
        }
        else
        {
            placeholder = slider.children[i];
            placeholder.textContent = '';
        }
        return placeholder;
    });

    // Hide the gallery if the background is touched / clicked
    addEvent(slider, 'click', function(e) {
        if ('img' !== e.target.tagName.toLowerCase())
            hideOverlay();
    }, {passive:true, capture:false});

    // listen for prev/next clicks
    addEvent(prevArrow, 'click', function(e) {
        e.preventDefault && e.preventDefault();
        showPrevious();
    }, {passive:false, capture:false});
    addEvent(nextArrow, 'click', function(e) {
        e.preventDefault && e.preventDefault();
        showNext();
    }, {passive:false, capture:false});

    // listen for esc/left/right keys
    addEvent(window, 'keydown', function(e) {
        if (27 === e.keyCode /*ESC*/) hideOverlay();
        else if (37 === e.keyCode /*LEFT*/) showPrevious();
        else if (39 === e.keyCode /*RIGHT*/) showNext();
    }, {passive:true, capture:false});

    // Listen for touch events on the body and check if they
    // originated in #gallerySlider img - the images in the slider.
    addEvent(document.body, 'touchstart', function(e) {
        if (
            'img' !== e.target.tagName.toLowerCase()
            || !closest(e.target, 'gallerySlider')
        ) return false;

        var touch = e, startX = touch.changedTouches[0].pageX;

        addEvent(slider, 'touchmove', touchmove = function touchmove(e) {
            e.preventDefault && e.preventDefault();
            touch = e.touches[0] || e.changedTouches[0];

            if (touch.pageX - startX > 10)
            {
                removeEvent(slider, 'touchmove', touchmove, {passive:false, capture:false});
                showPrevious();
            }
            else if (touch.pageX - startX < -10)
            {
                removeEvent(slider, 'touchmove', touchmove, {passive:false, capture:false});
                showNext();
            }
        }, {passive:false, capture:false});
        // Return false to prevent image
        // highlighting on Android
        return false;
    }, {passive:true, capture:false});

    addEvent(document.body, 'touchend', function() {
        if (touchmove) removeEvent(slider, 'touchmove', touchmove, {passive:false, capture:false});
    }, {passive:true, capture:false});

    // Listening for clicks on the thumbnails
    items.forEach(function(item, i) {
        addEvent(item, 'click', function(e) {
            e.preventDefault && e.preventDefault();

            // Find the position of this image
            // in the collection
            index = i;
            showOverlay(index);
            showImage(index);

            // Preload the next image
            preload(index + 1);

            // Preload the previous
            preload(index - 1);

        }, {passive:false, capture:false});
    });

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
                placeholders[index].textContent = '';
                placeholders[index].appendChild(this);
            });
        }
    };

    var showNext = function showNext() {
        // If this is not the last image
        if (index + 1 < items.length)
        {
            index++;
            offsetSlider(index);
            preload(index + 1);
        }
        else
        {
            // Trigger the spring animation
            addClass(slider, 'rightSpring');
            setTimeout(function() {
                removeClass(slider, 'rightSpring');
            }, 500);
        }
    };

    var showPrevious = function showPrevious() {
        // If this is not the first image
        if (index > 0)
        {
            index--;
            offsetSlider(index);
            preload(index - 1);
        }
        else
        {
            // Trigger the spring animation
            addClass(slider, 'leftSpring');
            setTimeout(function() {
                removeClass(slider, 'leftSpring');
            }, 500);
        }
    };
}
touchTouch.VERSION = '1.1.0';
// export it
window.touchTouch = touchTouch;
})();