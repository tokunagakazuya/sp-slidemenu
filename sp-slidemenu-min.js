!function(a,b,c){function d(a,b,c,e){return this instanceof d?this.init(a,b,c,e):new d(a,b,c,e)}function e(a){return g(a,function(a){return t.style[a]!==c})}function f(a){return a.charAt(0).toUpperCase()+a.substr(1)}function g(a,b){var c,d;for(c=0,d=a.length;d>c;c++)if(b(a[c],c))return!0;return!1}function h(a,b,d){var e=a.style;return h.cache||(h.cache={}),h.cache[b]!==c?(e[h.cache[b]]=d,void 0):e[b]!==c?(h.cache[b]=b,e[b]=d,void 0):(g(u,function(a){var g=f(a)+f(b);return e[g]!==c?(e[g]=d,!0):void 0}),void 0)}function i(a,b){var c;for(c in b)b.hasOwnProperty(c)&&h(a,c,b[c])}function j(a,b){var d;return a[b]!==c?a[b]:(g(u,function(e){var g=f(e)+f(b);return a[g]!==c?(d=a[g],!0):void 0}),d)}function k(a){var b;return k.cache||(k.cache={}),k.cache[a]!==c?k.cache[a]:t.style[a]!==c?(k.cache[a]=a,a):(g(u,function(d){var e=f(d)+f(a);return t.style[e]!==c?(b="-"+d+"-"+a,!0):void 0}),k.cache[a]=b,b)}function l(a,b){var c,d,e;return c=Function.prototype.bind,d=Array.prototype.slice,a.bind===c&&c?c.apply(a,d.call(arguments,1)):(e=d.call(arguments,2),function(){return a.apply(b,e.concat(d.call(arguments)))})}function m(a){a.preventDefault(),a.stopPropagation()}function n(a){var b,c,d,e;b={},d={position:"absolute",visibility:"hidden",display:"block"};for(c in d)b[c]=a.style[c],a.style[c]=d[c];e={width:a.offsetWidth,height:a.offsetHeight};for(c in d)a.style[c]=b[c];return e}function o(a,b){return a.changedTouches?a.changedTouches[0][b]:a[b]}function p(a,b,c,d){d=d||!1,v.touch?b.addEventListener(x[a].touch,c,d):b.addEventListener(x[a].mouse,c,d)}function q(a,b,c,d){d=d||!1,v.touch?b.removeEventListener(x[a].touch,c,d):b.removeEventListener(x[a].mouse,c,d)}function r(a,b){return b=" "+b+" ",1===a.nodeType&&(" "+a.className+" ").replace(C," ").indexOf(b)>=0?!0:!1}function s(a,b,c,d){var e,f,g,h,i;return e=+new Date,f=parseInt(a.style[b],10),c=parseInt(c,10),g=parseInt(d,10),h=function(a,b){return-(a/=b)*(a-2)},i=setInterval(function(){var d,j,k;d=new Date-e,d>g?(clearInterval(i),k=c):(j=h(d,g),k=j*(c-f)+f),a.style[b]=k+"px"},10)}var t,u,v,w,x,y,z,A,B,C,D;t=b.createElement("div"),u=["webkit","moz","o","ms"],v=d.support={},v.transform3d=e(["perspectiveProperty","WebkitPerspective","MozPerspective","OPerspective","msPerspective"]),v.transform=e(["transformProperty","WebkitTransform","MozTransform","OTransform","msTransform"]),v.transition=e(["transitionProperty","WebkitTransitionProperty","MozTransitionProperty","OTransitionProperty","msTransitionProperty"]),v.addEventListener="addEventListener"in a,v.msPointer=a.navigator.msPointerEnabled,v.cssAnimation=(v.transform3d||v.transform)&&v.transition,v.touch="ontouchend"in a,x={start:{touch:"touchstart",mouse:"mousedown"},move:{touch:"touchmove",mouse:"mousemove"},end:{touch:"touchend",mouse:"mouseup"}},w=!1,v.addEventListener&&(b.addEventListener("gesturestart",function(){w=!0}),b.addEventListener("gestureend",function(){w=!1})),y={slider:200,scrollOverBack:400},z={close:0,open:1,progress:2},A=10,B=50,C=/[\t\r\n\f]/g,D="menu-item",d.prototype.init=function(a,b,d,e){var f=this;if(f.setElement(a,b,d),!(f.main&&f.slidemenu&&f.button&&f.slidemenuBody&&f.slidemenuContent))throw new Error("Element not found. Please set correctly.");return e=e||{},f.disableCssAnimation=e.disableCssAnimation===c?!1:e.disableCssAnimation,f.disable3d=e.disable3d===c?!1:e.disable3d,f.direction="left","right"===e.direction&&(f.direction="right"),f.useCssAnimation=v.cssAnimation,f.disableCssAnimation===!0&&(f.useCssAnimation=!1),f.use3d=v.transform3d,f.disable3d===!0&&(f.use3d=!1),f.slideWidth=n(f.slidemenu).width,f.main.SpSlidemenuStatus=z.close,f.htmlOverflowX="",f.bodyOverflowX="",f.scrollCurrentY=0,f.scrollAnimationTimer=!1,f.scrollOverTimer=!1,f.setDefaultStyle(),f.bindMethods(),p("start",f.button,f.buttonTouchStart,!1),p("move",f.button,m,!1),p("end",f.button,f.buttonTouchEnd,!1),p("start",f.slidemenuContent,f.scrollTouchStart,!1),p("move",f.slidemenuContent,f.scrollTouchMove,!1),p("end",f.slidemenuContent,f.scrollTouchEnd,!1),f.slidemenuContent.addEventListener("click",f.itemClick,!1),f},d.prototype.bindMethods=function(){var a;a=this,funcs=["slideOpen","slideOpenEnd","slideClose","slideCloseEnd","buttonTouchStart","buttonTouchEnd","mainTouchStart","scrollTouchStart","scrollTouchMove","scrollTouchEnd","scrollInertiaMove","scrollOverBack","scrollOver","itemClick"],funcs.forEach(function(b){a[b]=l(a[b],a)})},d.prototype.setElement=function(a,c,d){var e=this;e.main=a,"string"==typeof a&&(e.main=b.querySelector(a)),e.slidemenu=c,"string"==typeof c&&(e.slidemenu=b.querySelector(c)),e.button=d,"string"==typeof d&&(e.button=b.querySelector(d)),e.slidemenu&&(e.slidemenuBody=e.slidemenu.querySelector(".slidemenu-body"),e.slidemenuContent=e.slidemenu.querySelector(".slidemenu-content"),e.slidemenuHeader=e.slidemenu.querySelector(".slidemenu-header"))},d.prototype.setDefaultStyle=function(){var a=this;v.msPointer&&(a.slidemenuContent.style.msTouchAction="none"),a.useCssAnimation?(i(a.main,{transitionProperty:k("transform"),transitionTimingFunction:"ease-in-out",transitionDuration:y.slider+"ms",transitionDelay:"0ms",transform:a.getTranslateX(0)}),i(a.slidemenu,{transitionProperty:"visibility",transitionTimingFunction:"linear",transitionDuration:"0ms",transitionDelay:y.slider+"ms"}),i(a.slidemenuContent,{transitionProperty:k("transform"),transitionTimingFunction:"ease-in-out",transitionDuration:"0ms",transitionDelay:"0ms",transform:a.getTranslateY(0)})):(i(a.main,{position:"relative",left:"0px"}),i(a.slidemenuContent,{top:"0px"}))},d.prototype.buttonTouchStart=function(a){var b=this;switch(a.preventDefault(),a.stopPropagation(),b.main.SpSlidemenuStatus){case z.progress:break;case z.open:case z.close:b.buttonStartPageX=o(a,"pageX"),b.buttonStartPageY=o(a,"pageY")}},d.prototype.buttonTouchEnd=function(a){var b=this;if(a.preventDefault(),a.stopPropagation(),b.shouldTrigerNext(a))switch(b.main.SpSlidemenuStatus){case z.progress:break;case z.open:b.slideClose(a);break;case z.close:b.slideOpen(a)}},d.prototype.mainTouchStart=function(a){var b=this;a.preventDefault(),a.stopPropagation(),b.slideClose(a)},d.prototype.shouldTrigerNext=function(a){var b=this,c=o(a,"pageX"),d=o(a,"pageY"),e=Math.abs(c-b.buttonStartPageX),f=Math.abs(d-b.buttonStartPageY);return 20>e&&20>f},d.prototype.slideOpen=function(){var a,c=this;a="left"===c.direction?c.slideWidth:-c.slideWidth,c.main.SpSlidemenuStatus=z.progress,p("move",b,m,!1),c.htmlOverflowX=b.documentElement.style.overflowX,c.bodyOverflowX=b.body.style.overflowX,b.documentElement.style.overflowX=b.body.style.overflowX="hidden",c.useCssAnimation?(i(c.main,{transform:c.getTranslateX(a)}),i(c.slidemenu,{transitionProperty:"z-index",visibility:"visible",zIndex:"1"})):(s(c.main,c.direction,a,y.slider),i(c.slidemenu,{visibility:"visible"})),setTimeout(c.slideOpenEnd,y.slider+B)},d.prototype.slideOpenEnd=function(){var a=this;a.main.SpSlidemenuStatus=z.open,a.useCssAnimation||i(a.slidemenu,{zIndex:"1"}),p("start",a.main,a.mainTouchStart,!1)},d.prototype.slideClose=function(){var a=this;a.main.SpSlidemenuStatus=z.progress,q("start",a.main,a.mainTouchStart,!1),a.useCssAnimation?(i(a.main,{transform:a.getTranslateX(0)}),i(a.slidemenu,{transitionProperty:"visibility",visibility:"hidden",zIndex:"-1"})):(s(a.main,a.direction,0,y.slider),i(a.slidemenu,{zIndex:"-1"})),setTimeout(a.slideCloseEnd,y.slider+B)},d.prototype.slideCloseEnd=function(){var a=this;a.main.SpSlidemenuStatus=z.close,b.documentElement.style.overflowX=a.htmlOverflowX,b.body.style.overflowX=a.bodyOverflowX,a.useCssAnimation||i(a.slidemenu,{visibility:"hidden"}),q("move",b,m,!1)},d.prototype.scrollTouchStart=function(a){var b=this;w||(b.scrollOverTimer!==!1&&clearTimeout(b.scrollOverTimer),b.scrollCurrentY=b.getScrollCurrentY(),b.useCssAnimation?i(b.slidemenuContent,{transitionTimingFunction:"ease-in-out",transitionDuration:"0ms",transform:b.getTranslateY(b.scrollCurrentY)}):(b.stopScrollAnimate(),i(b.slidemenuContent,{top:b.scrollCurrentY+"px"})),b.scrollOverTimer=!1,b.scrollAnimationTimer=!1,b.scrollTouchStarted=!0,b.scrollMoveReady=!1,b.scrollMoveEventCnt=0,b.scrollMaxY=b.calcMaxY(),b.scrollStartPageX=o(a,"pageX"),b.scrollStartPageY=o(a,"pageY"),b.scrollBasePageY=b.scrollStartPageY,b.scrollTimeForVelocity=a.timeStamp,b.scrollPageYForVelocity=b.scrollStartPageY,b.slidemenuContent.removeEventListener("click",m,!0))},d.prototype.scrollTouchMove=function(a){var b,c,d,e,f,g,h;b=this,b.scrollTouchStarted&&!w&&(c=o(a,"pageX"),d=o(a,"pageY"),b.scrollMoveReady?(a.preventDefault(),a.stopPropagation(),e=d-b.scrollBasePageY,f=b.scrollCurrentY+e,(f>0||f<b.scrollMaxY)&&(f=Math.round(b.scrollCurrentY+e/3)),b.scrollSetY(f),0===b.scrollMoveEventCnt%A&&(b.scrollPageYForVelocity=d,b.scrollTimeForVelocity=a.timeStamp),b.scrollMoveEventCnt++):(g=Math.abs(c-b.scrollStartPageX),h=Math.abs(d-b.scrollStartPageY),(g>5||h>5)&&(b.scrollMoveReady=!0,b.slidemenuContent.addEventListener("click",m,!0))),b.scrollBasePageY=d)},d.prototype.scrollTouchEnd=function(a){var b,c,d,e;if(b=this,b.scrollTouchStarted){if(b.scrollTouchStarted=!1,b.scrollMaxY=b.calcMaxY(),b.scrollCurrentY>0||b.scrollCurrentY<b.scrollMaxY)return b.scrollOverBack(),void 0;d=o(a,"pageY")-b.scrollPageYForVelocity,e=a.timeStamp-b.scrollTimeForVelocity,c=d/e,Math.abs(c)>=.01&&b.scrollInertia(c)}},d.prototype.scrollInertia=function(a){var b,c,d,e,f,g,h,i,j;b=this,a>0?(c=!0,d=0):(c=!1,d=b.scrollMaxY),e=Math.abs(b.scrollCurrentY-d),a=Math.abs(750*a),a>1e3&&(a=1e3),f=a/500,g=a*f-500*Math.pow(f,2)/2,e>=g?(h=c?b.scrollCurrentY+g:b.scrollCurrentY-g,i=1e3*f,b.scrollInertiaMove(h,i,!1)):(h=d,j=Math.sqrt(1e3*e+Math.pow(a,2)),i=1e3*((j-a)/500),b.scrollInertiaMove(h,i,!0,j,c))},d.prototype.scrollInertiaMove=function(a,b,c,d,e){var f=this;f.scrollCurrentY=a,f.useCssAnimation?i(f.slidemenuContent,{transitionTimingFunction:"cubic-bezier(0.33, 0.66, 0.66, 1)",transitionDuration:b+"ms",transform:f.getTranslateY(a)}):f.scrollAnimate(a,b),c&&(stopTime=d/7500,canMove=d*stopTime-7500*Math.pow(stopTime,2)/2,a=e?f.scrollCurrentY+canMove:f.scrollCurrentY-canMove,b=1e3*stopTime,f.scrollOver(a,b))},d.prototype.scrollOver=function(a,b){var c;c=this,c.scrollCurrentY=a,c.useCssAnimation?i(c.slidemenuContent,{transitionTimingFunction:"cubic-bezier(0.33, 0.66, 0.66, 1)",transitionDuration:b+"ms",transform:c.getTranslateY(a)}):c.scrollAnimate(a,b),c.scrollOverTimer=setTimeout(c.scrollOverBack,b)},d.prototype.scrollOverBack=function(){var a;_this=this,a=_this.scrollCurrentY>=0?0:_this.scrollMaxY,_this.scrollCurrentY=a,_this.useCssAnimation?i(_this.slidemenuContent,{transitionTimingFunction:"ease-out",transitionDuration:y.scrollOverBack+"ms",transform:_this.getTranslateY(a)}):_this.scrollAnimate(a,y.scrollOverBack)},d.prototype.scrollSetY=function(a){var b=this;b.scrollCurrentY=a,b.useCssAnimation?i(b.slidemenuContent,{transitionTimingFunction:"ease-in-out",transitionDuration:"0ms",transform:b.getTranslateY(a)}):b.slidemenuContent.style.top=a+"px"},d.prototype.scrollAnimate=function(a,b){var c=this;c.stopScrollAnimate(),c.scrollAnimationTimer=s(c.slidemenuContent,"top",a,b)},d.prototype.stopScrollAnimate=function(){var a=this;a.scrollAnimationTimer!==!1&&clearInterval(a.scrollAnimationTimer)},d.prototype.itemClick=function(a){var b=a.target||a.srcElement;r(b,D)&&this.slideClose()},d.prototype.calcMaxY=function(){var a,b,c,d;return a=this,b=a.slidemenuContent.offsetHeight,c=a.slidemenuBody.offsetHeight,d=0,a.slidemenuHeader&&(d=a.slidemenuHeader.offsetHeight),b>c?-(b-c+d):0},d.prototype.getScrollCurrentY=function(){var b=0;if(this.useCssAnimation)j(a.getComputedStyle(this.slidemenuContent,""),"transform").split(",").forEach(function(a){var c=parseInt(a,10);isNaN(c)||0===c||1===c||(b=c)});else{var c=parseInt(j(a.getComputedStyle(this.slidemenuContent,""),"top"),10);isNaN(c)||0===c||1===c||(b=c)}return b},d.prototype.getTranslateX=function(a){var b=this;return b.use3d?"translate3d("+a+"px, 0px, 0px)":"translate("+a+"px, 0px)"},d.prototype.getTranslateY=function(a){var b=this;return b.use3d?"translate3d(0px, "+a+"px, 0px)":"translate(0px, "+a+"px)"},a.SpSlidemenu=d}(window,window.document);