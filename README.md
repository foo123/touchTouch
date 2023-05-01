# touchTouch

Enhanced Vanilla JavaScript version of [touchTouch Optimized Mobile Gallery](https://github.com/tutorialzine/touchTouch) by Martin Angelov


![touchTouch Optimized Mobile Gallery](/touchtouch.jpg)


**version: 1.5.0** (9 kB minified)


[Live Demo](https://foo123.github.io/examples/touchtouch/)


**MIT License**


**API:** (see `test/demo.html`)

```html
<div id="gallery">
<a class="magnifier" href="./imgs/1.jpg"><img src="./imgs/thumbs/1.jpg" /></a>
<a class="magnifier" href="./imgs/2.jpg"><img src="./imgs/thumbs/2.jpg" /></a>
<a class="magnifier" href="./imgs/3.jpg"><img src="./imgs/thumbs/3.jpg" /></a>
</div>
```
```javascript
const slideshow = touchTouch(document.getElementById('gallery').querySelectorAll('.magnifier'), options);
slideshow.showGallery(); // show gallery programmatically
slideshow.hideGallery(); // hide gallery programmatically
slideshow.showNext(); // navigate to next image programmatically
slideshow.showPrevious(); // navigate to previous image programmatically
slideshow.dispose(); // dispose the slideshow instance
```

**Supported Options:**

* `slider` custom css class for gallery slider
* `prevArrow` custom css class for previous button
* `nextArrow` custom css class for next button
* `showCaption` boolean flag to show image numbering (**default** `false`)
* `caption` custom css class for caption
* `swipe` duration in `ms` for swipe animation (**default** `400`)
* `fit` scale factor in `[0, 1]` (relative to viewport dimensions) to fit image dimensions to current viewport (**default** `0` disabled)
* `auto` boolean flag indicating that passed images are the hrefs of the gallery images themselves, instead of clickable elements (**default** `false`)


**Supported Actions:**

* **Keyboard Navigation**: ESC (close), LEFT (previous image), RIGHT (next image)
* **Mouse Navigation**: CLICK BACKGROUND (close), CLICK LEFT ARROW (previous image), CLICK RIGHT ARROW (next image), SWIPE RIGHT (previous image), SWIPE LEFT (next image)
* **Touch Navigation**: TAP BACKGROUND (close), SWIPE RIGHT (previous image), SWIPE LEFT (next image)
* **Keyboard Gestures**: UP/DOWN (scale up/down image), CTRL/META + UP/DOWN/LEFT/RIGHT (move scaled image)
* **Mouse Gestures**: CTRL/META + WHEEL (scale up/down image), CTRL/META + MOVE (move scaled image)
* **Touch Gestures**: TWO-FINGER PINCH (scale up/down image), TWO-FINGER MOVE (move scaled image)


**see also:**

* [ModelView](https://github.com/foo123/modelview.js) a simple, fast, powerful and flexible MVVM framework for JavaScript
* [Contemplate](https://github.com/foo123/Contemplate) a fast and versatile isomorphic template engine for PHP, JavaScript, Python
* [HtmlWidget](https://github.com/foo123/HtmlWidget) html widgets, made as simple as possible, both client and server, both desktop and mobile, can be used as (template) plugins and/or standalone for PHP, JavaScript, Python (can be used as [plugins for Contemplate](https://github.com/foo123/Contemplate/blob/master/src/js/plugins/plugins.txt))
* [Paginator](https://github.com/foo123/Paginator)  simple and flexible pagination controls generator for PHP, JavaScript, Python
* [ColorPicker](https://github.com/foo123/ColorPicker) a fully-featured and versatile color picker widget
* [Pikadaytime](https://github.com/foo123/Pikadaytime) a refreshing JavaScript Datetimepicker that is ightweight, with no dependencies
* [Timer](https://github.com/foo123/Timer) count down/count up JavaScript widget
* [InfoPopup](https://github.com/foo123/InfoPopup) a simple JavaScript class to show info popups easily for various items and events (Desktop and Mobile)
* [Popr2](https://github.com/foo123/Popr2) a small and simple popup menu library
* [area-select.js](https://github.com/foo123/area-select.js) a simple JavaScript class to select rectangular regions in DOM elements (image, canvas, video, etc..)
* [area-sortable.js](https://github.com/foo123/area-sortable.js) simple and light-weight JavaScript class for handling smooth drag-and-drop sortable items of an area (Desktop and Mobile)
* [css-color](https://github.com/foo123/css-color) simple class for manipulating color values and color formats for css, svg, canvas/image
* [jquery-plugins](https://github.com/foo123/jquery-plugins) a collection of custom jQuery plugins
* [jquery-ui-widgets](https://github.com/foo123/jquery-ui-widgets) a collection of custom, simple, useful jQueryUI Widgets
* [touchTouch](https://github.com/foo123/touchTouch) a variation of touchTouch jQuery Optimized Mobile Gallery in pure vanilla JavaScript
* [Imagik](https://github.com/foo123/Imagik) fully-featured, fully-customisable and extendable Responsive CSS3 Slideshow
* [Carousel3](https://github.com/foo123/Carousel3) HTML5 Photo Carousel using Three.js
* [Rubik3](https://github.com/foo123/Rubik3) intuitive 3D Rubik Cube with Three.js
* [MOD3](https://github.com/foo123/MOD3) JavaScript port of AS3DMod ActionScript 3D Modifier Library
* [RT](https://github.com/foo123/RT) unified client-side real-time communication for JavaScript using XHR polling / BOSH / WebSockets / WebRTC
* [AjaxListener.js](https://github.com/foo123/AjaxListener.js): Listen to any AJAX event on page with JavaScript, even by other scripts
* [asynchronous.js](https://github.com/foo123/asynchronous.js) simple manager for asynchronous, linear, parallel, sequential and interleaved tasks for JavaScript
* [classy.js](https://github.com/foo123/classy.js) Object-Oriented mini-framework for JavaScript

