/**
 * sp-slidemenu.js
 *
 * @version  0.1.2
 * @url https://github.com/be-hase/sp-slidemenu
 *
 * Copyright 2013 be-hase.com.
 * Licensed under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 */

;(function(window, document, undefined) {
"use strict";

var div, PREFIX, support, gestureStart, EVENTS, ANIME_SPEED, SLIDE_STATUS, SCROLL_STATUS, THRESHOLD, EVENT_MOE_TIME, rclass, ITEM_CLICK_CLASS_NAME, defaults, checkPassiveHandler;

div = document.createElement('div');

PREFIX = ['webkit', 'moz', 'o', 'ms'];

support = SpSlidemenu.support = {};
support.transform3d = hasProp([
    'perspectiveProperty',
    'WebkitPerspective',
    'MozPerspective',
    'OPerspective',
    'msPerspective'
]);
support.transform = hasProp([
    'transformProperty',
    'WebkitTransform',
    'MozTransform',
    'OTransform',
    'msTransform'
]);
support.transition = hasProp([
    'transitionProperty',
    'WebkitTransitionProperty',
    'MozTransitionProperty',
    'OTransitionProperty',
    'msTransitionProperty'
]);
support.addEventListener = 'addEventListener' in window;
support.attachEvent = 'attachEvent' in window;
support.cssAnimation = (support.transform3d || support.transform) && support.transition;
support.touch = 'ontouchend' in window;
support.touchAction = hasProp(['touchAction']);
support.passive = false;
try {
    checkPassiveHandler = function() {};
    window.addEventListener("spslidemenucheckpassive",    checkPassiveHandler, { get passive() { support.passive = true; } });
    window.removeEventListener("spslidemenucheckpassive", checkPassiveHandler, { get passive() { support.passive = true; } });
} catch (err) { }

EVENTS = {
    start: {
        touch: 'touchstart',
        mouse: 'mousedown'
    },
    move: {
        touch: 'touchmove',
        mouse: 'mousemove'
    },
    end: {
        touch: 'touchend',
        mouse: 'mouseup'
    },
    wheel: {
        touch: 'MouseScrollEvent' in window ? 'MozMousePixelScroll' : 'onwheel' in document || document.documentMode >= 9 ? 'wheel' : 'mousewheel',
        mouse: 'MouseScrollEvent' in window ? 'MozMousePixelScroll' : 'onwheel' in document || document.documentMode >= 9 ? 'wheel' : 'mousewheel'
    }
};

defaults = {
    main               : "#main",
    button             : ".menu-button",
    slidemenu          : ".slidemenu",
    slidemenu_header   : ".slidemenu-header",
    slidemenu_body     : ".slidemenu-body",
    slidemenu_content  : ".slidemenu-content",
    disableCssAnimation: false,
    disable3d          : false,
    direction          : 'left'
};

gestureStart = false;
if (support.addEventListener) {
    document.addEventListener('gesturestart', function() {
        gestureStart = true;
    });

    document.addEventListener('gestureend', function() {
        gestureStart = false;
    });
}

ANIME_SPEED = {
    slider: 200,
    scrollOverBack: 400
};

SLIDE_STATUS = {
    close: 0,
    open: 1,
    progress: 2
};

THRESHOLD = 10;

EVENT_MOE_TIME = 50;

rclass = /[\t\r\n\f]/g;

ITEM_CLICK_CLASS_NAME = 'menu-item';

/*
[MEMO]
SpSlidemenu properties which is not function is ...

-- element --
element: main
element: slidemenu
element: button
element: slidemenuBody
element: slidemenuContent
element: slidemenuHeader

-- options --
bool: disableCssAnimation
bool: disabled3d

-- animation --
bool: useCssAnimation
bool: use3d

-- slide --
int: slideWidth
string: htmlOverflowX
string: bodyOverflowX
int: buttonStartPageX
int: buttonStartPageY

-- scroll --
bool: scrollTouchStarted
bool: scrollMoveReady
int: scrollStartPageX
int: scrollStartPageY
int: scrollBasePageY
int: scrollTimeForVelocity
int: scrollCurrentY
int: scrollMoveEventCnt
int: scrollAnimationTimer
int: scrollOverTimer
int: scrollMaxY
*/

function SpSlidemenu(options) {
    if (this instanceof SpSlidemenu) {
        return this.init(options);
    } else {
        return new SpSlidemenu(options);
    }
}

SpSlidemenu.prototype.init = function(options) {
    var _this = this;

    for(var k in defaults) {
      if (!options.hasOwnProperty(k)){
        options[k] = defaults[k];
      }
    }

    // find and set element.
    _this.setElement({
        main              : options.main,
        slidemenu         : options.slidemenu,
        button            : options.button,
        slidemenu_body    : options.slidemenu_body,
        slidemenu_content : options.slidemenu_content,
        slidemenu_header  : options.slidemenu_header
    });
    if (!_this.main || !_this.slidemenu || !_this.button || !_this.slidemenuBody || !_this.slidemenuContent) {
        throw new Error('Element not found. Please set correctly.');
    }

    _this.disableCssAnimation = (options.disableCssAnimation === undefined) ? false : options.disableCssAnimation;
    //Android 2.3 is true the disable3d
    _this.disable3d = hasAndroidMaxVersion(2.3) ? true : (options.disable3d === undefined) ? false : options.disable3d;
    _this.direction = 'left';
    if (options.direction === 'right') {
        _this.direction = 'right';
    }

    // animation
    _this.useCssAnimation = support.cssAnimation;
    if (_this.disableCssAnimation === true) {
        _this.useCssAnimation = false;
    }
    _this.use3d = support.transform3d;
    if (_this.disable3d === true) {
        _this.use3d = false;
    }

    // slide
    _this.slideWidth = (getDimentions(_this.slidemenu)).width;
    for (var i = _this.main.length; i--; ) {
        _this.main[i].SpSlidemenuStatus = SLIDE_STATUS.close;
    }
    _this.htmlOverflowX = '';
    _this.bodyOverflowX = '';

    // scroll
    _this.scrollCurrentY = 0;
    _this.scrollAnimationTimer = false;
    _this.scrollOverTimer = false;

    // set default style.
    _this.setDefaultStyle();

    // bind some method for callback.
    _this.bindMethods();

    // add event
    for (i = _this.button.length; i--; ) {
        addTouchEvent('start', _this.button[i], _this.buttonTouchStart, false);
        addTouchEvent('move', _this.button[i], blockEvent, false);
        addTouchEvent('end', _this.button[i], _this.buttonTouchEnd, false);
    }
    addTouchEvent('start', _this.slidemenuContent, _this.scrollTouchStart, false);
    addTouchEvent('move', _this.slidemenuContent, _this.scrollTouchMove, false);
    addTouchEvent('end', _this.slidemenuContent, _this.scrollTouchEnd, false);
    addTouchEvent('wheel', _this.slidemenuContent, _this.scrollWheel, false);

    if(support.addEventListener) {
        _this.slidemenuContent.addEventListener('click', _this.itemClick, getEventListenerWithOptions(false));
        window.addEventListener('resize', debounce(_this.setSize, 100), getEventListenerWithOptions(false));
    } else if(support.attachEvent){
        _this.slidemenuContent.attachEvent('onclick', _this.itemClick);
        window.attachEvent('onresize', debounce(_this.setSize, 100));
    }

    return _this;
};

SpSlidemenu.prototype.bindMethods = function() {
    var _this, funcs;
    _this = this;
    funcs = [
        'setSize',
        'slideOpen', 'slideOpenEnd', 'slideClose', 'slideCloseEnd',
        'buttonTouchStart', 'buttonTouchEnd', 'mainTouchStart',
        'scrollTouchStart', 'scrollTouchMove', 'scrollTouchEnd', 'scrollInertiaMove', 'scrollOverBack', 'scrollOver','scrollWheel',
        'itemClick'
    ];

    funcs.forEach(function(func) {
        _this[func] = bind(_this[func], _this);
    });
};

SpSlidemenu.prototype.setElement = function(options) {
    var _this, _main;
    _this = this;
    _main = options.main.split(",");

    for(var k in options) {
      if (typeof options[k] !== "string") {
        return false;
      }
    }

    _this.main = document.querySelectorAll(options.main);
    _this._mainBody = document.querySelector(_main[0]);
    _this.slidemenu = document.querySelector(options.slidemenu);
    _this.button = document.querySelectorAll(options.button);
    _this.slidemenuBody = _this.slidemenu.querySelector(options.slidemenu_body);
    _this.slidemenuContent = _this.slidemenu.querySelector(options.slidemenu_content);
    _this.slidemenuHeader = _this.slidemenu.querySelector(options.slidemenu_header);
};

SpSlidemenu.prototype.setDefaultStyle = function() {
    var _this = this;

    _this.slidemenuContent.style.touchAction = 'none';
    _this.setSize();
    if (_this.useCssAnimation) {
        for (var i = _this.main.length; i--; ) {
            if(hasAndroidMaxVersion(2.3) && hasPositionFixed(_this.main[i])) {
                setStyles(_this.main[i], {
                    left: '0px'
                });
            } else {
                setStyles(_this.main[i], {
                    transitionProperty: getCSSName('transform'),
                    transitionTimingFunction: 'ease-in-out',
                    transitionDuration: ANIME_SPEED.slider + 'ms',
                    transitionDelay: '0ms',
                    transform: ''
                });
            }
        }
        setStyles(_this.slidemenu, {
            transitionProperty: 'visibility',
            transitionTimingFunction: 'linear',
            transitionDuration: '0ms',
            transitionDelay: ANIME_SPEED.slider + 'ms',
            transform: 'translateZ(0)'
        });
        setStyles(_this.slidemenuContent, {
            transitionProperty: getCSSName('transform'),
            transitionTimingFunction: 'ease-in-out',
            transitionDuration: '0ms',
            transitionDelay: '0ms',
            transform: _this.getTranslateY(0)
        });
    } else {
        for (var i = _this.main.length; i--; ) {
            setStyles(_this.main[i], {
                left: '0px'
            });
        }
        setStyles(_this.slidemenuContent, {
            top: '0px'
        });
    }
};

SpSlidemenu.prototype.setSize = function(event) {
    var _this, browserHeight;
    _this = this;
    browserHeight = getBrowserHeight();

    setStyles(_this._mainBody, {
        minHeight: browserHeight + 'px'
    });
    setStyles(_this.slidemenu, {
        height: browserHeight + 'px'
    });

    if(!support.touchAction && !support.touch) {
        setStyles(_this.slidemenuBody,    { width: '' });
        setStyles(_this.slidemenuContent, { width: '' });
        setStyles(_this.slidemenuBody, {
            width: _this.slidemenuBody.clientWidth + 16 +'px',
            overflow: 'hidden'
        });
        setStyles(_this.slidemenuContent, {
            width: _this.slidemenuBody.clientWidth + 'px',
            overflowY: 'scroll'
        });
    }
};

SpSlidemenu.prototype.buttonTouchStart = function(event) {
    var _this = this;

    event.preventDefault ? event.preventDefault() : event.returnValue = false;
    event.stopPropagation? event.stopPropagation(): event.cancelBubble = true;

    triggerEvent('buttonTouchStart');

    for (var i = _this.main.length; i--; ) {
        switch(_this.main[i].SpSlidemenuStatus) {
        case SLIDE_STATUS.progress:
            break;
        case SLIDE_STATUS.open:
        case SLIDE_STATUS.close:
            _this.buttonStartPageX = getPage(event, 'pageX');
            _this.buttonStartPageY = getPage(event, 'pageY');
            break;
        }
    }
};

SpSlidemenu.prototype.buttonTouchEnd = function(event) {
    var _this = this;

    event.preventDefault ? event.preventDefault() : event.returnValue = false;
    event.stopPropagation? event.stopPropagation(): event.cancelBubble = true;

    triggerEvent('buttonTouchEnd');

    _this.setSize();
    _this.scrollCurrentY = _this.getScrollCurrentY();

    if (_this.shouldTrigerNext(event)) {
        setTimeout(function() {
          for (var i = _this.main.length; i--; ) {
            switch(_this.main[i].SpSlidemenuStatus) {
              case SLIDE_STATUS.progress:
                break;
              case SLIDE_STATUS.open:
                _this.slideClose(event);
                break;
              case SLIDE_STATUS.close:
                _this.slideOpen(event);
                break;
                }
            }
        }, 100);
    }
};

SpSlidemenu.prototype.mainTouchStart = function(event) {
    var _this = this;

    event.preventDefault ? event.preventDefault() : event.returnValue = false;
    event.stopPropagation? event.stopPropagation(): event.cancelBubble = true;

    _this.slideClose(event);
};

SpSlidemenu.prototype.shouldTrigerNext = function(event) {
    var _this = this,
        buttonEndPageX = getPage(event, 'pageX'),
        buttonEndPageY = getPage(event, 'pageY'),
        deltaX = Math.abs(buttonEndPageX - _this.buttonStartPageX),
        deltaY = Math.abs(buttonEndPageY - _this.buttonStartPageY);

    return deltaX < 20 && deltaY < 20;
};

SpSlidemenu.prototype.slideOpen = function(event) {
    var _this = this, toX;
    triggerEvent('slideOpen');

    if (_this.direction === 'left') {
        toX = _this.slideWidth;
    } else {
        toX = -_this.slideWidth;
    }
    for (var i = _this.main.length; i--; ) {
        _this.main[i].SpSlidemenuStatus = SLIDE_STATUS.progress;
    }

    //set event
    addTouchEvent('move', document, blockEvent, false);

    // change style
    _this.htmlOverflowX = document.documentElement.style['overflowX'];
    _this.bodyOverflowX = document.body.style['overflowX'];
    document.documentElement.style['overflowX'] = document.body.style['overflowX'] = 'hidden';
    if (_this.useCssAnimation) {
        for (var i = _this.main.length; i--; ) {
            if(hasAndroidMaxVersion(2.3) && hasPositionFixed(_this.main[i])) {
                _this.main[i].style['left']  = '';
                _this.main[i].style['right'] = '';
                animate(_this.main[i], _this.direction, Math.abs(toX), ANIME_SPEED.slider);
            } else {
                setStyles(_this.main[i], {
                    transform: _this.getTranslateX(toX)
                });
            }
        }
        setStyles(_this.slidemenu, {
            transitionProperty: 'z-index',
            visibility: 'visible',
            zIndex: '1'
        });
    } else {
        for (var i = _this.main.length; i--; ) {
            _this.main[i].style['left']  = '';
            _this.main[i].style['right'] = '';
            animate(_this.main[i], _this.direction, Math.abs(toX), ANIME_SPEED.slider);
        }
        setStyles(_this.slidemenu, {
            visibility: 'visible'
        });
    }

    // set callback
    setTimeout(_this.slideOpenEnd, ANIME_SPEED.slider + EVENT_MOE_TIME);
};
SpSlidemenu.prototype.slideOpenEnd = function() {
    var _this = this;
    triggerEvent('slideOpenEnd');

    for (var i = _this.main.length; i--; ) {
        _this.main[i].SpSlidemenuStatus = SLIDE_STATUS.open;
    }

    // change style
    if (_this.useCssAnimation) {
    } else {
        setStyles(_this.slidemenu, {
            zIndex: '1'
        });
    }

    // add event
    for (var i = _this.main.length; i--; ) {
        addTouchEvent('start', _this.main[i], _this.mainTouchStart, false);
    }
};

SpSlidemenu.prototype.slideClose = function(event) {
    var _this = this;
    triggerEvent('slideClose');

    for (var i = _this.main.length; i--; ) {
        _this.main[i].SpSlidemenuStatus = SLIDE_STATUS.progress;
    }

    //event
    for (var i = _this.main.length; i--; ) {
        removeTouchEvent('start', _this.main[i], _this.mainTouchStart, false);
    }

    // change style
    if (_this.useCssAnimation) {
        setStyles(_this.slidemenu, {
            transitionProperty: 'visibility',
            visibility: 'hidden',
            zIndex: '-1'
        });

        setTimeout( function() {
          for (var i = _this.main.length; i--; ) {
            if(hasAndroidMaxVersion(2.3) && hasPositionFixed(_this.main[i])) {
              animate(_this.main[i], _this.direction, 0, ANIME_SPEED.slider);
            } else {
              setStyles(_this.main[i], {
                transform: ''
              });
            }
          }
        }, 50);
    } else {
        for (var i = _this.main.length; i--; ) {
            animate(_this.main[i], _this.direction, 0, ANIME_SPEED.slider);
        }
        setStyles(_this.slidemenu, {
            zIndex: '-1'
        });
    }

    // set callback
    setTimeout(_this.slideCloseEnd, ANIME_SPEED.slider + EVENT_MOE_TIME);
};
SpSlidemenu.prototype.slideCloseEnd = function() {
    var _this = this;
    triggerEvent('slideCloseEnd');

    for (var i = _this.main.length; i--; ) {
        _this.main[i].SpSlidemenuStatus = SLIDE_STATUS.close;
    }

    // change style
    document.documentElement.style['overflowX'] = _this.htmlOverflowX;
    document.body.style['overflowX'] = _this.bodyOverflowX;
    if (_this.useCssAnimation) {
    } else {
        setStyles(_this.slidemenu, {
            visibility: 'hidden'
        });
    }

    // set event
    removeTouchEvent('move', document, blockEvent, false);
};

SpSlidemenu.prototype.scrollTouchStart = function(event) {
    var _this = this;

    if (gestureStart) {
        return;
    }

    triggerEvent('scrollTouchStart');

    if (_this.scrollOverTimer !== false) {
        clearTimeout(_this.scrollOverTimer);
    }

    _this.scrollCurrentY = _this.getScrollCurrentY();
    if (_this.useCssAnimation) {
        setStyles(_this.slidemenuContent, {
            transitionTimingFunction: 'ease-in-out',
            transitionDuration: '0ms',
            transform: _this.getTranslateY(_this.scrollCurrentY)
        });
    } else {
        _this.stopScrollAnimate();
        setStyles(_this.slidemenuContent, {
            top: _this.scrollCurrentY + 'px'
        });
    }

    _this.scrollOverTimer = false;
    _this.scrollAnimationTimer = false;
    _this.scrollTouchStarted = true;
    _this.scrollMoveReady = false;
    _this.scrollMoveEventCnt = 0;
    _this.scrollMaxY = _this.calcMaxY();
    _this.scrollStartPageX = getPage(event, 'pageX');
    _this.scrollStartPageY = getPage(event, 'pageY');
    _this.scrollBasePageY = _this.scrollStartPageY;
    _this.scrollTimeForVelocity = event.timeStamp;
    _this.scrollPageYForVelocity = _this.scrollStartPageY;

    if(support.addEventListener) {
        _this.slidemenuContent.removeEventListener('click', blockEvent, getEventListenerWithOptions(true));
    } else if(support.attachEvent){
        _this.slidemenuContent.detachEvent('onclick', blockEvent);
    }
};

SpSlidemenu.prototype.scrollTouchMove = function(event) {
    var _this, pageX, pageY, distY, newY, deltaX, deltaY;
    _this = this;

    if (!_this.scrollTouchStarted || gestureStart) {
        return;
    }

    triggerEvent('scrollTouchMove');

    pageX = getPage(event, 'pageX');
    pageY = getPage(event, 'pageY');

    if (_this.scrollMoveReady) {
        event.preventDefault ? event.preventDefault() : event.returnValue = false;
        event.stopPropagation? event.stopPropagation(): event.cancelBubble = true;
        distY = pageY - _this.scrollBasePageY;
        newY = _this.scrollCurrentY + distY;
        if (newY > 0 || newY < _this.scrollMaxY) {
            newY = Math.round(_this.scrollCurrentY + distY / 3);
        }
        _this.scrollSetY(newY);

        if (_this.scrollMoveEventCnt % THRESHOLD === 0) {
            _this.scrollPageYForVelocity = pageY;
            _this.scrollTimeForVelocity = event.timeStamp;
        }
        _this.scrollMoveEventCnt++;
    } else {
        deltaX = Math.abs(pageX - _this.scrollStartPageX);
        deltaY = Math.abs(pageY - _this.scrollStartPageY);
        if (deltaX > 5 || deltaY > 5) {
            _this.scrollMoveReady = true;
            if(support.addEventListener) {
                _this.slidemenuContent.addEventListener('click', blockEvent, getEventListenerWithOptions(true));
            } else if(support.attachEvent){
                _this.slidemenuContent.attachEvent('onclick', blockEvent);
            }
        }
    }

    _this.scrollBasePageY = pageY;
};

SpSlidemenu.prototype.scrollWheel = function(event) {
    var _this, delta,newY;
    _this = this;

    event.preventDefault ? event.preventDefault() : event.returnValue = false;
    event.stopPropagation? event.stopPropagation(): event.cancelBubble = true;

    triggerEvent('scrollWheel');

    if(!_this.scrollMaxY) {
        _this.scrollMaxY = _this.calcMaxY();
    }

    delta = event.deltaY ? -(event.deltaY) : event.wheelDelta ? (event.wheelDelta / 2) : -(event.detail);

    if (!delta) {
        return;
    }

    newY = Math.round(_this.scrollCurrentY + delta);
    newY = newY > 0 ? 0: newY < _this.scrollMaxY ? _this.scrollMaxY:newY;

    _this.scrollSetY(newY);
};

SpSlidemenu.prototype.scrollTouchEnd = function(event) {
    var _this, speed, deltaY, deltaTime;
    _this = this;

    if (!_this.scrollTouchStarted) {
        return;
    }

    triggerEvent('scrollTouchEnd');

    _this.scrollTouchStarted = false;
    _this.scrollMaxY = _this.calcMaxY();

    if (_this.scrollCurrentY > 0 || _this.scrollCurrentY < _this.scrollMaxY) {
        _this.scrollOverBack();
        return;
    }

    deltaY = getPage(event, 'pageY') - _this.scrollPageYForVelocity;
    deltaTime = event.timeStamp - _this.scrollTimeForVelocity;
    speed = deltaY / deltaTime;

    if (Math.abs(speed) >= 0.01) {
        _this.scrollInertia(speed);
    }
};

SpSlidemenu.prototype.scrollInertia = function(speed) {
    var _this, directionToTop, maxTo, distanceMaxTo, stopTime, canMove, to, duration, speedAtboundary, nextTo;
    _this = this;

    if (speed > 0) {
        directionToTop = true;
        maxTo = 0;
    } else {
        directionToTop = false;
        maxTo = _this.scrollMaxY;
    }

    distanceMaxTo = Math.abs(_this.scrollCurrentY - maxTo);

    speed = Math.abs(750 * speed);
    if (speed > 1000) {
        speed = 1000;
    }

    stopTime = speed / 500;
    canMove = (speed * stopTime) - ((500 * Math.pow(stopTime, 2)) / 2);

    if (canMove <= distanceMaxTo) {
        if (directionToTop) {
            to = _this.scrollCurrentY + canMove;
        } else {
            to = _this.scrollCurrentY - canMove;
        }
        duration = stopTime * 1000;
        _this.scrollInertiaMove(to, duration, false);
    } else {
        to = maxTo;
        speedAtboundary = Math.sqrt((2 * 500 * distanceMaxTo) + Math.pow(speed, 2));
        duration = (speedAtboundary - speed) / 500  * 1000;
        _this.scrollInertiaMove(to, duration, true, speedAtboundary, directionToTop);
    }
};

SpSlidemenu.prototype.scrollInertiaMove = function(to, duration, isOver, speed, directionToTop) {
    var _this = this, stopTime, canMove;

    _this.scrollCurrentY = to;
    if (_this.useCssAnimation) {
        setStyles(_this.slidemenuContent,{
            transitionTimingFunction: 'cubic-bezier(0.33, 0.66, 0.66, 1)',
            transitionDuration: duration + 'ms',
            transform: _this.getTranslateY(to)
        });
    } else {
        _this.scrollAnimate(to, duration);
    }

    if (!isOver) {
        return;
    }

    stopTime = speed / 7500;
    canMove = (speed * stopTime) - ((7500 * Math.pow(stopTime, 2)) / 2);
    if (directionToTop) {
        to = _this.scrollCurrentY + canMove;
    } else {
        to = _this.scrollCurrentY - canMove;
    }
    duration = stopTime * 1000;
    _this.scrollOver(to, duration);
};

SpSlidemenu.prototype.scrollOver = function(to, duration) {
    var _this;
    _this = this;

    _this.scrollCurrentY = to;
    if (_this.useCssAnimation) {
        setStyles(_this.slidemenuContent,{
            transitionTimingFunction: 'cubic-bezier(0.33, 0.66, 0.66, 1)',
            transitionDuration: duration + 'ms',
            transform: _this.getTranslateY(to)
        });
    } else {
        _this.scrollAnimate(to, duration);
    }

    _this.scrollOverTimer = setTimeout(_this.scrollOverBack, duration);
};

SpSlidemenu.prototype.scrollOverBack = function() {
    var _this, to;
    _this = this;
    if (_this.scrollCurrentY >= 0) {
        to = 0;
    } else {
        to = _this.scrollMaxY;
    }

    _this.scrollCurrentY = to;
    if (_this.useCssAnimation) {
        setStyles(_this.slidemenuContent,{
            transitionTimingFunction: 'ease-out',
            transitionDuration: ANIME_SPEED.scrollOverBack + 'ms',
            transform: _this.getTranslateY(to)
        });
    } else {
        _this.scrollAnimate(to, ANIME_SPEED.scrollOverBack);
    }
};

SpSlidemenu.prototype.scrollSetY = function(y) {
    var _this = this;

    _this.scrollCurrentY = y;
    if (_this.useCssAnimation) {
        setStyles(_this.slidemenuContent,{
            transitionTimingFunction: 'ease-in-out',
            transitionDuration: '0ms',
            transform: _this.getTranslateY(y)
        });
    } else {
        _this.slidemenuContent.style.top = y + 'px';
    }
};

SpSlidemenu.prototype.scrollAnimate = function(to, transitionDuration) {
    var _this = this;

    _this.stopScrollAnimate();
    _this.scrollAnimationTimer = animate(_this.slidemenuContent, 'top', to, transitionDuration);
};

SpSlidemenu.prototype.stopScrollAnimate = function() {
    var _this = this;
    if (_this.scrollAnimationTimer !== false) {
        clearInterval(_this.scrollAnimationTimer);
    }
};

SpSlidemenu.prototype.itemClick = function(event) {
    var elem = event.target || event.srcElement;

    if (hasClass(elem, ITEM_CLICK_CLASS_NAME)) {
        this.slideClose();
    }
};

SpSlidemenu.prototype.calcMaxY = function(x) {
    var _this, contentHeight, bodyHeight, headerHeight;
    _this = this;
    contentHeight = _this.slidemenuContent.offsetHeight;
    bodyHeight = _this.slidemenuBody.offsetHeight;
    headerHeight = 0;
    if (_this.slidemenuHeader) {
        headerHeight = _this.slidemenuHeader.offsetHeight;
    }
    if (contentHeight > bodyHeight) {
        return - (contentHeight - bodyHeight + headerHeight);
    } else {
        return 0;
    }
};

SpSlidemenu.prototype.getScrollCurrentY = function() {
    var ret = 0;

    if (this.useCssAnimation) {
        getStyle(window.getComputedStyle(this.slidemenuContent, ''), 'transform').split(',').forEach(function(value){
            var number = parseInt(value, 10);
            if (!isNaN(number) && number !== 0 && number !== 1) {
                ret = number;
            }
        });
    } else {
        var number = parseInt(getStyle(window.getComputedStyle(this.slidemenuContent, ''), 'top'), 10);
        if (!isNaN(number) && number !== 0 && number !== 1) {
            ret = number;
        }
    }
    return ret;
};

SpSlidemenu.prototype.getTranslateX = function(x) {
    var _this = this;

    return _this.use3d ? 'translate3d(' + x + 'px, 0px, 0px)' : 'translate(' + x + 'px, 0px)';
};

SpSlidemenu.prototype.getTranslateY = function(y) {
    var _this = this;

    return _this.use3d ? 'translate3d(0px, ' + y + 'px, 0px)' : 'translate(0px, ' + y + 'px)';
};



//Utility Function
function hasProp(props) {
    return some(props, function(prop) {
        return div.style[prop] !== undefined;
    });
}
function upperCaseFirst(str) {
    return str.charAt(0).toUpperCase() + str.substr(1);
}
function some(ary, callback) {
    var i, len;

    for (i = 0, len = ary.length; i < len; i++) {
        if (callback(ary[i], i)) {
            return true;
        }
    }
    return false;
}
function setStyle(elem, prop, val) {
    var style = elem.style;
    if (!setStyle.cache) {
        setStyle.cache = {};
    }

    if (setStyle.cache[prop] !== undefined) {
        style[setStyle.cache[prop]] = val;
        return;
    }
    if (style[prop] !== undefined) {
        setStyle.cache[prop] = prop;
        style[prop] = val;
        return;
    }
    some(PREFIX, function(_prefix) {
        var _prop = upperCaseFirst(_prefix) + upperCaseFirst(prop);
        if (style[_prop] !== undefined) {
            //setStyle.cache[prop] = _prop;
            style[_prop] = val;
            return true;
        }
    });
}
function setStyles(elem, styles) {
    var style, prop;

    for (prop in styles) {
        if (styles.hasOwnProperty(prop)) {
            setStyle(elem, prop, styles[prop]);
        }
    }
}
function getStyle(style, prop) {
    var ret;

    if (style[prop] !== undefined) {
        return style[prop];
    }
    some(PREFIX, function(_prefix) {
        var _prop = upperCaseFirst(_prefix) + upperCaseFirst(prop);
        if (style[_prop] !== undefined) {
            ret = style[_prop];
            return true;
        }
    });
    return ret;
}
function getCSSName(prop) {
    var ret;

    if (!getCSSName.cache) {
        getCSSName.cache = {};
    }
    if (getCSSName.cache[prop] !== undefined) {
        return getCSSName.cache[prop];
    }
    if (div.style[prop] !== undefined) {
        getCSSName.cache[prop] = prop;
        return prop;
    }
    some(PREFIX, function(_prefix) {
        var _prop = upperCaseFirst(_prefix) + upperCaseFirst(prop);

        if (div.style[_prop] !== undefined) {
            ret = '-' + _prefix + '-' + prop;
            return true;
        }
    });
    getCSSName.cache[prop] = ret;
    return ret;
}
function bind(func, context) {
    var nativeBind, slice, args;
    nativeBind = Function.prototype.bind;
    slice = Array.prototype.slice;

    if (func.bind === nativeBind && nativeBind) {
        return nativeBind.apply(func, slice.call(arguments, 1));
    }

    args = slice.call(arguments, 2);
    return function() {
        return func.apply(context, args.concat(slice.call(arguments)));
    };
}
function blockEvent(event) {
    event.preventDefault ? event.preventDefault() : event.returnValue = false;
    event.stopPropagation? event.stopPropagation(): event.cancelBubble = true;
}
function getDimentions(element) {
    var previous, key, properties, result;
    previous = {};
    properties = {
        position: 'absolute',
        visibility: 'hidden',
        display: 'block'
    };

    for (key in properties) {
        previous[key] = element.style[key];
        element.style[key] = properties[key];
    }

    result = {
        width: element.offsetWidth,
        height: element.offsetHeight
    };

    for (key in properties) {
        element.style[key] = previous[key];
    }

    return result;
}
function getPage(event, page) {
    return event.changedTouches ? event.changedTouches[0][page] : event[page];
}
function addTouchEvent(eventType, element, listener, useCapture) {
    useCapture = useCapture || false;

    if (support.touch) {
        element.addEventListener(EVENTS[eventType].touch, listener, getEventListenerWithOptions(useCapture));
    } else {
        if(support.addEventListener) {
            element.addEventListener(EVENTS[eventType].mouse, listener, getEventListenerWithOptions(useCapture));
        } else if(support.attachEvent){
            element.attachEvent('on'+EVENTS[eventType].mouse, listener);
        }
    }
}
function removeTouchEvent(eventType, element, listener, useCapture) {
    useCapture = useCapture || false;

    if (support.touch) {
        element.removeEventListener(EVENTS[eventType].touch, listener, getEventListenerWithOptions(useCapture));
    } else {
        if(support.addEventListener) {
            element.removeEventListener(EVENTS[eventType].mouse, listener, getEventListenerWithOptions(useCapture));
        } else if(support.attachEvent){
            element.detachEvent('on'+EVENTS[eventType].mouse, listener);
        }
    }
}
function triggerEvent(eventName) {
    var event;
    eventName += '-spSlidermenu';
    try {
        event = new CustomEvent(eventName);
    } catch (e) {
        event = document.createEvent('CustomEvent');
        event.initCustomEvent(eventName, false, false, null);
    }
    document.dispatchEvent(event);
}
function hasClass(elem, className) {
    className = " " + className + " ";
    if (elem.nodeType === 1 && (" " + elem.className + " ").replace(rclass, " ").indexOf(className) >= 0 ) {
        return true;
    }

    return false;
}
function animate(elem, prop, to, transitionDuration) {
    var begin, from, duration, easing, timer;
    begin = +new Date();
    from = parseInt(elem.style[prop], 10);
    to = parseInt(to, 10);
    duration = parseInt(transitionDuration, 10);
    easing = function(time, duration) {
        return -(time /= duration) * (time - 2);
    };


    timer = setInterval(function() {
        var time, pos, now;
        time = new Date() - begin;
        if (time > duration) {
            clearInterval(timer);
            now = to;
        } else {
            pos = easing(time, duration);
            now = pos * (to - from) + from;
        }
        elem.style[prop] = now + 'px';
    }, 10);
    return timer;
}
function getBrowserHeight() {
    if ( window.innerHeight ) {
        return window.innerHeight;
    }
    else if ( document.documentElement && document.documentElement.clientHeight !== 0 ) {
        return document.documentElement.clientHeight;
    }
    else if ( document.body ) {
        return document.body.clientHeight;
    }
    return 0;
}
function debounce(func, wait, immediate) {
    var timeout, result;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) result = func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) result = func.apply(context, args);
        return result;
    };
}
function getEventListenerWithOptions(useCapture) {
    useCapture = useCapture || false;

    if(support.passive) {
        useCapture = {
            passive: false,
            capture: useCapture
        }
    }

    return useCapture
}
function hasAndroidMaxVersion(version) {
    var ua = navigator.userAgent;
    return ua.indexOf("Android") > -1 && parseFloat(ua.slice(ua.indexOf("Android")+8)) <= version;
}
function hasPositionFixed(elem) {
    return window.getComputedStyle(elem, '').position === 'fixed'
}

window.SpSlidemenu = SpSlidemenu;

})(window, window.document);
