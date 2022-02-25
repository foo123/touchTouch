/**
*  touchTouch.js
*  Vanilla JavaScript version of https://github.com/tutorialzine/touchTouch Optimized Mobile Gallery by Martin Angelov
*  @VERSION: 1.2.0
*  @license: MIT License
*
*  https://github.com/foo123/touchTouch
*
**/
(function() {
"use strict";

var eventOptionsSupported = null,
    trim_re = /^\s+|\s+$/g,
    trim = String.prototype.trim
        ? function(s) {return s.trim();}
        : function(s) {return s.replace(trim_re, '');}
;

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

function setup()
{
    if (!overlay)
    {
        // Appending the markup to the page
        overlay = document.createElement('div');
        overlay.id = 'galleryOverlay';
        if ('ontouchstart' in window)
            addClass(overlay, 'is-touch-screen');
        document.body.appendChild(hide(overlay));
        // listen for esc/left/right keys
        addEvent(window, 'keydown', function(e) {
            if (activeInstance)
            {
                if (27 === e.keyCode /*ESC*/) hideOverlay();
                else if (37 === e.keyCode /*LEFT*/) activeInstance.showPrevious();
                else if (39 === e.keyCode /*RIGHT*/) activeInstance.showNext();
            }
        }, {passive:true, capture:false});
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
    show(overlay);
    // Trigger the opacity CSS transition
    setTimeout(function() {addClass(overlay, 'visible');}, 100);
}
function hideOverlay()
{
    // If the overlay is not shown, exit
    if (!overlayVisible) return false;
    overlayVisible = false;
    activeInstance = null;
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

/* Creating the plugin */
function touchTouch(items, options)
{
    var self = this;
    if (!(self instanceof touchTouch))
        return new touchTouch(items, options);

    /* Private variables */
    var slider, prevArrow, nextArrow,
        placeholders, index = 0,
        itemClick, sliderClick, prevArrowClick, nextArrowClick,
        sliderTouchStart, sliderTouchMove, sliderTouchEnd;

    options = options || {};
    setup();
    slider = document.createElement('div');
    prevArrow = document.createElement('a');
    nextArrow = document.createElement('a');
    slider.id = 'gallerySlider' + String(++id);
    addClass(slider, 'gallery-slider');
    if (options.slider)
        addClass(slider, options.slider);
    addClass(prevArrow, 'prev-arrow');
    if (options.prevArrow)
        addClass(prevArrow, options.prevArrow);
    addClass(nextArrow, 'next-arrow');
    if (options.nextArrow)
        addClass(nextArrow, options.nextArrow);

    items = Array.prototype.slice.call(items || []);

    // Creating a placeholder for each image
    placeholders = items.map(function(item, i) {
        var placeholder;
        placeholder = document.createElement('div');
        addClass(placeholder, 'placeholder');
        slider.appendChild(placeholder);
        return placeholder;
    });

    // Hide the gallery if the background is touched / clicked
    addEvent(slider, 'click', sliderClick = function(e) {
        if (('img' !== e.target.tagName.toLowerCase()))
            hideOverlay();
    }, {passive:true, capture:false});

    // listen for prev/next clicks
    addEvent(prevArrow, 'click', prevArrowClick = function(e) {
        e.preventDefault && e.preventDefault();
        self.showPrevious();
    }, {passive:false, capture:false});
    addEvent(nextArrow, 'click', nextArrowClick = function(e) {
        e.preventDefault && e.preventDefault();
        self.showNext();
    }, {passive:false, capture:false});

    // Listen for touch events on the body and check if they
    // originated in #gallerySlider img - the images in the slider.
    addEvent(slider, 'touchstart', sliderTouchStart = function(e) {
        if (
            'img' !== e.target.tagName.toLowerCase()
            || !closest(e.target, slider.id)
        ) return false;

        var touch = e, startX = touch.changedTouches[0].pageX;

        addEvent(slider, 'touchmove', sliderTouchMove = function sliderTouchMove(e) {
            e.preventDefault && e.preventDefault();
            touch = e.touches[0] || e.changedTouches[0];

            if (touch.pageX - startX > 10)
            {
                removeEvent(slider, 'touchmove', sliderTouchMove, {passive:false, capture:false});
                self.showPrevious();
            }
            else if (touch.pageX - startX < -10)
            {
                removeEvent(slider, 'touchmove', sliderTouchMove, {passive:false, capture:false});
                self.showNext();
            }
        }, {passive:false, capture:false});
        // Return false to prevent image
        // highlighting on Android
        return false;
    }, {passive:true, capture:false});

    addEvent(slider, 'touchend', sliderTouchEnd = function() {
        if (sliderTouchMove) removeEvent(slider, 'touchmove', sliderTouchMove, {passive:false, capture:false});
    }, {passive:true, capture:false});

    // Listening for clicks on the thumbnails
    itemClick = items.map(function(item, i) {
        var click;
        addEvent(item, 'click', click = function(e) {
            e.preventDefault && e.preventDefault();
            // Find the position of this image
            // in the collection
            index = i;
            self.showGallery();
        }, {passive:false, capture:false});
        return click;
    });

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
                placeholders[index].textContent = '';
                placeholders[index].appendChild(this);
            });
        }
    };

    self.showNext = function showNext() {
        if (activeInstance !== self) return;
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
            setTimeout(function() {removeClass(slider, 'rightSpring');}, 500);
        }
    };

    self.showPrevious = function showPrevious() {
        if (activeInstance !== self) return;
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
            setTimeout(function() {removeClass(slider, 'leftSpring');}, 500);
        }
    };

    self.dispose = function() {
        if (slider)
        {
            if (activeInstance === self) hideOverlay();
            if (sliderTouchMove) removeEvent(slider, 'touchmove', sliderTouchMove, {passive:false, capture:false});
            removeEvent(slider, 'touchstart', sliderTouchStart, {passive:true, capture:false});
            removeEvent(slider, 'touchend', sliderTouchEnd, {passive:true, capture:false});
            removeEvent(slider, 'click', sliderClick, {passive:true, capture:false});
            removeEvent(prevArrow, 'click', prevArrowClick, {passive:false, capture:false});
            removeEvent(nextArrow, 'click', nextArrowClick, {passive:false, capture:false});
            items.forEach(function(item, i){
                removeEvent(item, 'click', itemClick[i], {passive:false, capture:false});
            });
            slider.textContent = '';
            slider = null;
            prevArrow = null;
            nextArrow = null;
            placeholders = null;
            items = null;
            itemClick = null;
            sliderTouchMove = null;
            sliderTouchStart = null;
            sliderTouchEnd = null;
            sliderClick = null;
            prevArrowClick = null;
            nextArrowClick = null;
            options = null;
            self.showGallery = null;
            self.showNext = null;
            self.showPrevious = null;
        }
    };
}
touchTouch.VERSION = '1.2.0';
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