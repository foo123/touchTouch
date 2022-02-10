/**
*  touchTouch.js
*  Vanilla JavaScript version of https://github.com/tutorialzine/touchTouch Optimized Mobile Gallery by Martin Angelov
*  @VERSION: 1.0.0
 * @license		MIT License
*
*  https://github.com/foo123/touchTouch
*
**/
(function() {
"use strict";

var $ = '$tT';

// add custom property to Element.prototype to avoid browser issues
if (
    window.Element
    && !Object.prototype.hasOwnProperty.call(window.Element.prototype, $)
)
    window.Element.prototype[$] = null;

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
var overlay = null, slider = null, prevArrow = null, nextArrow = null,
    overlayVisible = false, touchmove = null;

function setup()
{
    if (!overlay && !slider)
    {
        overlay = document.createElement('div');
        slider = document.createElement('div');
        prevArrow = document.createElement('a');
        nextArrow = document.createElement('a');
        overlay.id = 'galleryOverlay';
        slider.id = 'gallerySlider';
        prevArrow.id = 'prevArrow';
        nextArrow.id = 'nextArrow';
    }
}

/* Creating the plugin */
window.touchTouch = function(items) {

    var placeholders = [], index = 0;

    items = Array.prototype.slice.call(items || []);

    // Appending the markup to the page
    setup();
    document.body.appendChild(hide(overlay));
    overlay.appendChild(slider);

    // Creating a placeholder for each image
    items.forEach(function() {
        var placeholder = document.createElement('div');
        placeholder.classList.add("placeholder");
        slider.appendChild(placeholder);
        placeholders.push(placeholder);
    });

    // Hide the gallery if the background is touched / clicked
    slider.addEventListener('click', function(e) {
        if (e.target.tagName.toLowerCase() !== 'img')
            hideOverlay();
    }, false);

    // Listen for touch events on the body and check if they
    // originated in #gallerySlider img - the images in the slider.
    document.body.addEventListener('touchstart', function(e) {
        if (
            e.target.tagName.toLowerCase() !== 'img'
            || !e.target.closest('#gallerySlider')
        ) return false;

        var touch = e, startX = touch.changedTouches[0].pageX;

        slider.addEventListener('touchmove', touchmove = function touchmove(e) {

            e.preventDefault();

            touch = e.touches[0] || e.changedTouches[0];

            if (touch.pageX - startX > 10)
            {
                slider.removeEventListener('touchmove', touchmove, false);
                showPrevious();
            }
            else if (touch.pageX - startX < -10)
            {
                slider.removeEventListener('touchmove', touchmove, false);
                showNext();
            }
        }, false);

        // Return false to prevent image
        // highlighting on Android
        return false;

    }, false);
    document.body.addEventListener('touchend', function() {
        slider.removeEventListener('touchmove', touchmove, false);
    }, false);

    // Listening for clicks on the thumbnails
    items.forEach(function(item, i) {
        item.addEventListener('click', function(e) {
            e.preventDefault();

            // Find the position of this image
            // in the collection
            index = i;
            showOverlay(index);
            showImage(index);

            // Preload the next image
            preload(index+1);

            // Preload the previous
            preload(index-1);

        }, false);
    });

    if ('ontouchstart' in window)
    {
        prevArrow.classList.add('hasTouch');
        nextArrow.classList.add('hasTouch');
    }
    overlay.appendChild(prevArrow);
    overlay.appendChild(nextArrow);

    prevArrow.addEventListener('click', function(e) {
        e.preventDefault();
        showPrevious();
    }, false);

    nextArrow.addEventListener('click', function(e) {
        e.preventDefault();
        showNext();
    }, false);

    // Listen for arrow keys
    window.addEventListener('keydown', function(e) {
        if (e.keyCode === 37) showPrevious();
        else if (e.keyCode === 39) showNext();
    }, false);


    /* Private functions */
    function showOverlay(index)
    {
        // If the overlay is already shown, exit
        if (overlayVisible) return false;

        // Show the overlay
        show(overlay);

        setTimeout(function() {
            // Trigger the opacity CSS transition
            overlay.classList.add('visible');
        }, 100);

        // Move the slider to the correct image
        offsetSlider(index);

        // Raise the visible flag
        overlayVisible = true;
    }

    function hideOverlay()
    {
        // If the overlay is not shown, exit
        if (!overlayVisible) return false;

        // Hide the overlay
        hide(overlay).classList.remove('visible');
        overlayVisible = false;
    }

    function offsetSlider(index)
    {
        // This will trigger a smooth css transition
        slider.style.left = String(-index*100)+'%';
    }

    // Preload an image by its index in the items array
    function preload(index)
    {
        setTimeout(function() {
            showImage(index);
        }, 1000);
    }

    // Show image in the slider
    function showImage(index)
    {
        // If the index is outside the bonds of the array
        if (index < 0 || index >= items.length) return false;

        // Call the load function with the href attribute of the item
        if (!placeholders[index].children.length)
        {
            loadImage(items[index].href, function() {
                placeholders[index].innerHTML = '';
                placeholders[index].appendChild(this);
            });
        }
    }

    // Load the image and execute a callback function.
    function loadImage(src, callback)
    {
        var img = document.createElement('img');
        img.addEventListener('load', function() {
            callback.call(img);
        });
        img.src = src;
    }

    function showNext()
    {
        // If this is not the last image
        if (index+1 < items.length)
        {
            index++;
            offsetSlider(index);
            preload(index+1);
        }
        else
        {
            // Trigger the spring animation
            slider.classList.add('rightSpring');
            setTimeout(function() {
                slider.classList.remove('rightSpring');
            }, 500);
        }
    }

    function showPrevious()
    {
        // If this is not the first image
        if (index > 0)
        {
            index--;
            offsetSlider(index);
            preload(index-1);
        }
        else
        {
            // Trigger the spring animation
            slider.classList.add('leftSpring');
            setTimeout(function() {
                slider.classList.remove('leftSpring');
            }, 500);
        }
    }
};
})();