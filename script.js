/* ------------------ Croppie ----------------- */
!function(e,t){"function"==typeof define&&define.amd?define(["exports"],t):"object"==typeof exports&&"string"!=typeof exports.nodeName?t(exports):t(e.commonJsStrict={})}(this,(function(e){"function"!=typeof Promise&&function(e){function t(e,t){return function(){e.apply(t,arguments)}}function i(e){if("object"!=typeof this)throw new TypeError("Promises must be constructed via new");if("function"!=typeof e)throw new TypeError("not a function");this._state=null,this._value=null,this._deferreds=[],s(e,t(o,this),t(r,this))}function n(e){var t=this;return null===this._state?void this._deferreds.push(e):void h((function(){var i=t._state?e.onFulfilled:e.onRejected;if(null!==i){var n;try{n=i(t._value)}catch(t){return void e.reject(t)}e.resolve(n)}else(t._state?e.resolve:e.reject)(t._value)}))}function o(e){try{if(e===this)throw new TypeError("A promise cannot be resolved with itself.");if(e&&("object"==typeof e||"function"==typeof e)){var i=e.then;if("function"==typeof i)return void s(t(i,e),t(o,this),t(r,this))}this._state=!0,this._value=e,a.call(this)}catch(e){r.call(this,e)}}function r(e){this._state=!1,this._value=e,a.call(this)}function a(){for(var e=0,t=this._deferreds.length;t>e;e++)n.call(this,this._deferreds[e]);this._deferreds=null}function s(e,t,i){var n=!1;try{e((function(e){n||(n=!0,t(e))}),(function(e){n||(n=!0,i(e))}))}catch(e){if(n)return;n=!0,i(e)}}var l=setTimeout,h="function"==typeof setImmediate&&setImmediate||function(e){l(e,1)},u=Array.isArray||function(e){return"[object Array]"===Object.prototype.toString.call(e)};i.prototype.catch=function(e){return this.then(null,e)},i.prototype.then=function(e,t){var o=this;return new i((function(i,r){n.call(o,new function(e,t,i,n){this.onFulfilled="function"==typeof e?e:null,this.onRejected="function"==typeof t?t:null,this.resolve=i,this.reject=n}(e,t,i,r))}))},i.all=function(){var e=Array.prototype.slice.call(1===arguments.length&&u(arguments[0])?arguments[0]:arguments);return new i((function(t,i){function n(r,a){try{if(a&&("object"==typeof a||"function"==typeof a)){var s=a.then;if("function"==typeof s)return void s.call(a,(function(e){n(r,e)}),i)}e[r]=a,0==--o&&t(e)}catch(e){i(e)}}if(0===e.length)return t([]);for(var o=e.length,r=0;r<e.length;r++)n(r,e[r])}))},i.resolve=function(e){return e&&"object"==typeof e&&e.constructor===i?e:new i((function(t){t(e)}))},i.reject=function(e){return new i((function(t,i){i(e)}))},i.race=function(e){return new i((function(t,i){for(var n=0,o=e.length;o>n;n++)e[n].then(t,i)}))},i._setImmediateFn=function(e){h=e},"undefined"!=typeof module&&module.exports?module.exports=i:e.Promise||(e.Promise=i)}(this),"function"!=typeof window.CustomEvent&&function(){function e(e,t){t=t||{bubbles:!1,cancelable:!1,detail:void 0};var i=document.createEvent("CustomEvent");return i.initCustomEvent(e,t.bubbles,t.cancelable,t.detail),i}e.prototype=window.Event.prototype,window.CustomEvent=e}(),HTMLCanvasElement.prototype.toBlob||Object.defineProperty(HTMLCanvasElement.prototype,"toBlob",{value:function(e,t,i){for(var n=atob(this.toDataURL(t,i).split(",")[1]),o=n.length,r=new Uint8Array(o),a=0;a<o;a++)r[a]=n.charCodeAt(a);e(new Blob([r],{type:t||"image/png"}))}});var t,i,n,o=["Webkit","Moz","ms"],r=document.createElement("div").style,a=[1,8,3,6],s=[2,7,4,5];function l(e){if(e in r)return e;for(var t=e[0].toUpperCase()+e.slice(1),i=o.length;i--;)if((e=o[i]+t)in r)return e}function h(e,t){for(var i in e=e||{},t)t[i]&&t[i].constructor&&t[i].constructor===Object?(e[i]=e[i]||{},h(e[i],t[i])):e[i]=t[i];return e}function u(e){return h({},e)}function c(e){if("createEvent"in document){var t=document.createEvent("HTMLEvents");t.initEvent("change",!1,!0),e.dispatchEvent(t)}else e.fireEvent("onchange")}function p(e,t,i){if("string"==typeof t){var n=t;(t={})[n]=i}for(var o in t)e.style[o]=t[o]}function d(e,t){e.classList?e.classList.add(t):e.className+=" "+t}function m(e,t){for(var i in t)e.setAttribute(i,t[i])}function f(e){return parseInt(e,10)}function v(e,t){var i=e.naturalWidth,n=e.naturalHeight,o=t||b(e);if(o&&o>=5){var r=i;i=n,n=r}return{width:i,height:n}}i=l("transform"),t=l("transformOrigin"),n=l("userSelect");var g={translate3d:{suffix:", 0px"},translate:{suffix:""}},w=function(e,t,i){this.x=parseFloat(e),this.y=parseFloat(t),this.scale=parseFloat(i)};w.parse=function(e){return e.style?w.parse(e.style[i]):e.indexOf("matrix")>-1||e.indexOf("none")>-1?w.fromMatrix(e):w.fromString(e)},w.fromMatrix=function(e){var t=e.substring(7).split(",");return t.length&&"none"!==e||(t=[1,0,0,1,0,0]),new w(f(t[4]),f(t[5]),parseFloat(t[0]))},w.fromString=function(e){var t=e.split(") "),i=t[0].substring(q.globals.translate.length+1).split(","),n=t.length>1?t[1].substring(6):1,o=i.length>1?i[0]:0,r=i.length>1?i[1]:0;return new w(o,r,n)},w.prototype.toString=function(){var e=g[q.globals.translate].suffix||"";return q.globals.translate+"("+this.x+"px, "+this.y+"px"+e+") scale("+this.scale+")"};var y=function(e){if(!e||!e.style[t])return this.x=0,void(this.y=0);var i=e.style[t].split(" ");this.x=parseFloat(i[0]),this.y=parseFloat(i[1])};function b(e){return e.exifdata?e.exifdata.Orientation:1}function x(e,t,i){var n=t.width,o=t.height,r=e.getContext("2d");switch(e.width=t.width,e.height=t.height,r.save(),i){case 2:r.translate(n,0),r.scale(-1,1);break;case 3:r.translate(n,o),r.rotate(180*Math.PI/180);break;case 4:r.translate(0,o),r.scale(1,-1);break;case 5:e.width=o,e.height=n,r.rotate(90*Math.PI/180),r.scale(1,-1);break;case 6:e.width=o,e.height=n,r.rotate(90*Math.PI/180),r.translate(0,-o);break;case 7:e.width=o,e.height=n,r.rotate(-90*Math.PI/180),r.translate(-n,o),r.scale(1,-1);break;case 8:e.width=o,e.height=n,r.translate(0,n),r.rotate(-90*Math.PI/180)}r.drawImage(t,0,0,n,o),r.restore()}function C(){var e,t,o,r,a,s=this.options.viewport.type?"cr-vp-"+this.options.viewport.type:null;this.options.useCanvas=this.options.enableOrientation||E.call(this),this.data={},this.elements={},e=this.elements.boundary=document.createElement("div"),t=this.elements.viewport=document.createElement("div"),this.elements.img=document.createElement("img"),o=this.elements.overlay=document.createElement("div"),this.options.useCanvas?(this.elements.canvas=document.createElement("canvas"),this.elements.preview=this.elements.canvas):this.elements.preview=this.elements.img,d(e,"cr-boundary"),e.setAttribute("aria-dropeffect","none"),r=this.options.boundary.width,a=this.options.boundary.height,p(e,{width:r+(isNaN(r)?"":"px"),height:a+(isNaN(a)?"":"px")}),d(t,"cr-viewport"),s&&d(t,s),p(t,{width:this.options.viewport.width+"px",height:this.options.viewport.height+"px"}),t.setAttribute("tabindex",0),d(this.elements.preview,"cr-image"),m(this.elements.preview,{alt:"preview","aria-grabbed":"false"}),d(o,"cr-overlay"),this.element.appendChild(e),e.appendChild(this.elements.preview),e.appendChild(t),e.appendChild(o),d(this.element,"croppie-container"),this.options.customClass&&d(this.element,this.options.customClass),function(){var e,t,o,r,a,s=this,l=!1;function h(e,t){var i=s.elements.preview.getBoundingClientRect(),n=a.y+t,o=a.x+e;s.options.enforceBoundary?(r.top>i.top+t&&r.bottom<i.bottom+t&&(a.y=n),r.left>i.left+e&&r.right<i.right+e&&(a.x=o)):(a.y=n,a.x=o)}function u(e){s.elements.preview.setAttribute("aria-grabbed",e),s.elements.boundary.setAttribute("aria-dropeffect",e?"move":"none")}function d(i){if((void 0===i.button||0===i.button)&&(i.preventDefault(),!l)){if(l=!0,e=i.pageX,t=i.pageY,i.touches){var o=i.touches[0];e=o.pageX,t=o.pageY}u(l),a=w.parse(s.elements.preview),window.addEventListener("mousemove",m),window.addEventListener("touchmove",m),window.addEventListener("mouseup",f),window.addEventListener("touchend",f),document.body.style[n]="none",r=s.elements.viewport.getBoundingClientRect()}}function m(n){var r=n.pageX,l=n.pageY;if(n.touches){var u=n.touches[0];r=u.pageX,l=u.pageY}var d=r-e,m=l-t,f={};if("touchmove"===n.type&&n.touches.length>1){var v=n.touches[0],g=n.touches[1],w=Math.sqrt((v.pageX-g.pageX)*(v.pageX-g.pageX)+(v.pageY-g.pageY)*(v.pageY-g.pageY));o||(o=w/s._currentZoom);var y=w/o;return L.call(s,y),void c(s.elements.zoomer)}h(d,m),f[i]=a.toString(),p(s.elements.preview,f),R.call(s),t=l,e=r}function f(){u(l=!1),window.removeEventListener("mousemove",m),window.removeEventListener("touchmove",m),window.removeEventListener("mouseup",f),window.removeEventListener("touchend",f),document.body.style[n]="",B.call(s),Y.call(s),o=0}s.elements.overlay.addEventListener("mousedown",d),s.elements.viewport.addEventListener("keydown",(function(e){var t=37,l=38,u=39,c=40;if(!e.shiftKey||e.keyCode!==l&&e.keyCode!==c){if(s.options.enableKeyMovement&&e.keyCode>=37&&e.keyCode<=40){e.preventDefault();var d=function(e){switch(e){case t:return[1,0];case l:return[0,1];case u:return[-1,0];case c:return[0,-1]}}(e.keyCode);a=w.parse(s.elements.preview),document.body.style[n]="none",r=s.elements.viewport.getBoundingClientRect(),function(e){var t,r,l={};h(e[0],e[1]),l[i]=a.toString(),p(s.elements.preview,l),R.call(s),document.body.style[n]="",B.call(s),Y.call(s),o=0}(d)}}else{var m=0;m=e.keyCode===l?parseFloat(s.elements.zoomer.value,10)+parseFloat(s.elements.zoomer.step,10):parseFloat(s.elements.zoomer.value,10)-parseFloat(s.elements.zoomer.step,10),s.setZoom(m)}})),s.elements.overlay.addEventListener("touchstart",d)}.call(this),this.options.enableZoom&&function(){var e=this,t=e.elements.zoomerWrap=document.createElement("div"),i=e.elements.zoomer=document.createElement("input");function n(){_.call(e,{value:parseFloat(i.value),origin:new y(e.elements.preview),viewportRect:e.elements.viewport.getBoundingClientRect(),transform:w.parse(e.elements.preview)})}function o(t){var i,o;if("ctrl"===e.options.mouseWheelZoom&&!0!==t.ctrlKey)return 0;i=t.wheelDelta?t.wheelDelta/1200:t.deltaY?t.deltaY/1060:t.detail?t.detail/-60:0,o=e._currentZoom+i*e._currentZoom,t.preventDefault(),L.call(e,o),n.call(e)}d(t,"cr-slider-wrap"),d(i,"cr-slider"),i.type="range",i.step="0.0001",i.value=1,i.style.display=e.options.showZoomer?"":"none",i.setAttribute("aria-label","zoom"),e.element.appendChild(t),t.appendChild(i),e._currentZoom=1,e.elements.zoomer.addEventListener("input",n),e.elements.zoomer.addEventListener("change",n),e.options.mouseWheelZoom&&(e.elements.boundary.addEventListener("mousewheel",o),e.elements.boundary.addEventListener("DOMMouseScroll",o))}.call(this),this.options.enableResize&&function(){var e,t,i,o,r,a,s,l=this,h=document.createElement("div"),u=!1,c=50;function m(a){if((void 0===a.button||0===a.button)&&(a.preventDefault(),!u)){var s=l.elements.overlay.getBoundingClientRect();if(u=!0,t=a.pageX,i=a.pageY,e=-1!==a.currentTarget.className.indexOf("vertical")?"v":"h",o=s.width,r=s.height,a.touches){var h=a.touches[0];t=h.pageX,i=h.pageY}window.addEventListener("mousemove",f),window.addEventListener("touchmove",f),window.addEventListener("mouseup",v),window.addEventListener("touchend",v),document.body.style[n]="none"}}function f(n){var a=n.pageX,s=n.pageY;if(n.preventDefault(),n.touches){var u=n.touches[0];a=u.pageX,s=u.pageY}var d=a-t,m=s-i,f=l.options.viewport.height+m,v=l.options.viewport.width+d;"v"===e&&f>=c&&f<=r?(p(h,{height:f+"px"}),l.options.boundary.height+=m,p(l.elements.boundary,{height:l.options.boundary.height+"px"}),l.options.viewport.height+=m,p(l.elements.viewport,{height:l.options.viewport.height+"px"})):"h"===e&&v>=c&&v<=o&&(p(h,{width:v+"px"}),l.options.boundary.width+=d,p(l.elements.boundary,{width:l.options.boundary.width+"px"}),l.options.viewport.width+=d,p(l.elements.viewport,{width:l.options.viewport.width+"px"})),R.call(l),k.call(l),B.call(l),Y.call(l),i=s,t=a}function v(){u=!1,window.removeEventListener("mousemove",f),window.removeEventListener("touchmove",f),window.removeEventListener("mouseup",v),window.removeEventListener("touchend",v),document.body.style[n]=""}d(h,"cr-resizer"),p(h,{width:this.options.viewport.width+"px",height:this.options.viewport.height+"px"}),this.options.resizeControls.height&&(d(a=document.createElement("div"),"cr-resizer-vertical"),h.appendChild(a)),this.options.resizeControls.width&&(d(s=document.createElement("div"),"cr-resizer-horisontal"),h.appendChild(s)),a&&(a.addEventListener("mousedown",m),a.addEventListener("touchstart",m)),s&&(s.addEventListener("mousedown",m),s.addEventListener("touchstart",m)),this.elements.boundary.appendChild(h)}.call(this)}function E(){return this.options.enableExif&&window.EXIF}function L(e){if(this.options.enableZoom){var t=this.elements.zoomer,i=j(e,4);t.value=Math.max(t.min,Math.min(t.max,i))}}function _(e){var n=this,o=e?e.transform:w.parse(n.elements.preview),r=e?e.viewportRect:n.elements.viewport.getBoundingClientRect(),a=e?e.origin:new y(n.elements.preview);function s(){var e={};e[i]=o.toString(),e[t]=a.toString(),p(n.elements.preview,e)}if(n._currentZoom=e?e.value:n._currentZoom,o.scale=n._currentZoom,n.elements.zoomer.setAttribute("aria-valuenow",n._currentZoom),s(),n.options.enforceBoundary){var l=function(e){var t=this._currentZoom,i=e.width,n=e.height,o=this.elements.boundary.clientWidth/2,r=this.elements.boundary.clientHeight/2,a=this.elements.preview.getBoundingClientRect(),s=a.width,l=a.height,h=i/2,u=n/2,c=-1*(h/t-o),p=-1*(u/t-r),d=1/t*h,m=1/t*u;return{translate:{maxX:c,minX:c-(s*(1/t)-i*(1/t)),maxY:p,minY:p-(l*(1/t)-n*(1/t))},origin:{maxX:s*(1/t)-d,minX:d,maxY:l*(1/t)-m,minY:m}}}.call(n,r),h=l.translate,u=l.origin;o.x>=h.maxX&&(a.x=u.minX,o.x=h.maxX),o.x<=h.minX&&(a.x=u.maxX,o.x=h.minX),o.y>=h.maxY&&(a.y=u.minY,o.y=h.maxY),o.y<=h.minY&&(a.y=u.maxY,o.y=h.minY)}s(),X.call(n),Y.call(n)}function B(){var e=this._currentZoom,n=this.elements.preview.getBoundingClientRect(),o=this.elements.viewport.getBoundingClientRect(),r=w.parse(this.elements.preview.style[i]),a=new y(this.elements.preview),s=o.top-n.top+o.height/2,l=o.left-n.left+o.width/2,h={},u={};h.y=s/e,h.x=l/e,u.y=(h.y-a.y)*(1-e),u.x=(h.x-a.x)*(1-e),r.x-=u.x,r.y-=u.y;var c={};c[t]=h.x+"px "+h.y+"px",c[i]=r.toString(),p(this.elements.preview,c)}function R(){if(this.elements){var e=this.elements.boundary.getBoundingClientRect(),t=this.elements.preview.getBoundingClientRect();p(this.elements.overlay,{width:t.width+"px",height:t.height+"px",top:t.top-e.top+"px",left:t.left-e.left+"px"})}}y.prototype.toString=function(){return this.x+"px "+this.y+"px"};var Z,z,M,I,X=(Z=R,z=500,function(){var e=this,t=arguments,i=M;clearTimeout(I),I=setTimeout((function(){I=null,Z.apply(e,t)}),z),i&&Z.apply(e,t)});function Y(){var e,t=this.get();F.call(this)&&(this.options.update.call(this,t),this.$&&"undefined"==typeof Prototype?this.$(this.element).trigger("update.croppie",t):(window.CustomEvent?e=new CustomEvent("update",{detail:t}):(e=document.createEvent("CustomEvent")).initCustomEvent("update",!0,!0,t),this.element.dispatchEvent(e)))}function F(){return this.elements.preview.offsetHeight>0&&this.elements.preview.offsetWidth>0}function W(){var e,n={},o=this.elements.preview,r=new w(0,0,1),a=new y;F.call(this)&&!this.data.bound&&(this.data.bound=!0,n[i]=r.toString(),n[t]=a.toString(),n.opacity=1,p(o,n),e=this.elements.preview.getBoundingClientRect(),this._originalImageWidth=e.width,this._originalImageHeight=e.height,this.data.orientation=b(this.elements.img),this.options.enableZoom?k.call(this,!0):this._currentZoom=1,r.scale=this._currentZoom,n[i]=r.toString(),p(o,n),this.data.points.length?function(e){if(4!==e.length)throw"Croppie - Invalid number of points supplied: "+e;var n=e[2]-e[0],o=this.elements.viewport.getBoundingClientRect(),r=this.elements.boundary.getBoundingClientRect(),a_left=o.left-r.left,a_top=o.top-r.top,s=o.width/n,l=e[1],h=e[0],u=-1*e[1]+a_top,c=-1*e[0]+a_left,d={};d[t]=h+"px "+l+"px",d[i]=new w(c,u,s).toString(),p(this.elements.preview,d),L.call(this,s),this._currentZoom=s}.call(this,this.data.points):function(){var e=this.elements.preview.getBoundingClientRect(),t=this.elements.viewport.getBoundingClientRect(),n=this.elements.boundary.getBoundingClientRect(),o=t.left-n.left,r=t.top-n.top,a=o-(e.width-t.width)/2,s=r-(e.height-t.height)/2,l=new w(a,s,this._currentZoom);p(this.elements.preview,i,l.toString())}.call(this),B.call(this),R.call(this))}function k(e){var t,i,n,o,r=0,a=this.options.maxZoom||1.5,s=this.elements.zoomer,l=parseFloat(s.value),h=this.elements.boundary.getBoundingClientRect(),u=v(this.elements.img,this.data.orientation),p=this.elements.viewport.getBoundingClientRect();this.options.enforceBoundary&&(n=p.width/u.width,o=p.height/u.height,r=Math.max(n,o)),r>=a&&(a=r+1),s.min=j(r,4),s.max=j(a,4),!e&&(l<s.min||l>s.max)?L.call(this,l<s.min?s.min:s.max):e&&(i=Math.max(h.width/u.width,h.height/u.height),t=null!==this.data.boundZoom?this.data.boundZoom:i,L.call(this,t)),c(s)}function A(e){var t=e.points,i=f(t[0]),n=f(t[1]),o=f(t[2])-i,r=f(t[3])-n,a=e.circle,s=document.createElement("canvas"),l=s.getContext("2d"),h=e.outputWidth||o,u=e.outputHeight||r;return e.outputWidth&&e.outputHeight,s.width=h,s.height=u,e.backgroundColor&&(l.fillStyle=e.backgroundColor,l.fillRect(0,0,h,u)),!1!==this.options.enforceBoundary&&(o=Math.min(o,this._originalImageWidth),r=Math.min(r,this._originalImageHeight)),l.drawImage(this.elements.preview,i,n,o,r,0,0,h,u),a&&(l.fillStyle="#fff",l.globalCompositeOperation="destination-in",l.beginPath(),l.arc(s.width/2,s.height/2,s.width/2,0,2*Math.PI,!0),l.closePath(),l.fill()),s}function O(e,t){var i,n,o,r,a=this,s=[],l=null,h=E.call(a);if("string"==typeof e)i=e,e={};else if(Array.isArray(e))s=e.slice();else{if(void 0===e&&a.data.url)return W.call(a),Y.call(a),null;i=e.url,s=e.points||[],l=void 0===e.zoom?null:e.zoom}return a.data.bound=!1,a.data.url=i||a.data.url,a.data.boundZoom=l,(n=i,o=h,r=new Image,r.style.opacity=0,new Promise((function(e){function t(){r.style.opacity=1,setTimeout((function(){e(r)}),1)}r.removeAttribute("crossOrigin"),n.match(/^https?:\/\/|^\/\//)&&r.setAttribute("crossOrigin","anonymous"),r.onload=function(){o?EXIF.getData(r,(function(){t()})):t()},r.src=n}))).then((function(i){if(function(e){this.elements.img.parentNode&&(Array.prototype.forEach.call(this.elements.img.classList,(function(t){e.classList.add(t)})),this.elements.img.parentNode.replaceChild(e,this.elements.img),this.elements.preview=e),this.elements.img=e}.call(a,i),s.length)a.options.relative&&(s=[s[0]*i.naturalWidth/100,s[1]*i.naturalHeight/100,s[2]*i.naturalWidth/100,s[3]*i.naturalHeight/100]);else{var n,o,r=v(i),l=a.elements.viewport.getBoundingClientRect(),h=l.width/l.height;r.width/r.height>h?n=(o=r.height)*h:(n=r.width,o=r.height/h);var u=(r.width-n)/2,c=(r.height-o)/2,p=u+n,d=c+o;a.data.points=[u,c,p,d]}a.data.points=s.map((function(e){return parseFloat(e)})),a.options.useCanvas&&function(e){var t=this.elements.canvas,i=this.elements.img,n=t.getContext("2d"),o=E.call(this);e=this.options.enableOrientation&&e,n.clearRect(0,0,t.width,t.height),t.width=i.width,t.height=i.height,o&&!e?x(t,i,f(b(i)||0)):e&&x(t,i,e)}.call(a,e.orientation||1),W.call(a),Y.call(a),t&&t()})).catch((function(e){console.error("Croppie:"+e)}))}function j(e,t){return parseFloat(e).toFixed(t||0)}function H(){var e=this.elements.preview.getBoundingClientRect(),t=this.elements.viewport.getBoundingClientRect(),i=t.left-e.left,n=t.top-e.top,o=(t.width-this.elements.viewport.offsetWidth)/2,r=(t.height-this.elements.viewport.offsetHeight)/2,a=i+this.elements.viewport.offsetWidth+o,s=n+this.elements.viewport.offsetHeight+r,l=this._currentZoom;(l===1/0||isNaN(l))&&(l=1);var h=this.options.enforceBoundary?0:Number.NEGATIVE_INFINITY;return i=Math.max(h,i/l),n=Math.max(h,n/l),a=Math.max(h,a/l),s=Math.max(h,s/l),{points:[j(i),j(n),j(a),j(s)],zoom:l,orientation:this.data.orientation}}var N={type:"canvas",format:"png",quality:1},S=["jpeg","webp","png"];function P(e){var t=this,i=H.call(t),n=h(u(N),u(e)),o="string"==typeof e?e:n.type||"base64",r=n.size||"viewport",a=n.format,s=n.quality,l=n.backgroundColor,c="boolean"==typeof n.circle?n.circle:"circle"===t.options.viewport.type,m=t.elements.viewport.getBoundingClientRect(),f=m.width/m.height;return"viewport"===r?(i.outputWidth=m.width,i.outputHeight=m.height):"object"==typeof r&&(r.width&&r.height?(i.outputWidth=r.width,i.outputHeight=r.height):r.width?(i.outputWidth=r.width,i.outputHeight=r.width/f):r.height&&(i.outputWidth=r.height*f,i.outputHeight=r.height)),S.indexOf(a)>-1&&(i.format="image/"+a,i.quality=s),i.circle=c,i.url=t.data.url,i.backgroundColor=l,new Promise((function(e,n){switch(o.toLowerCase()){case"rawcanvas":e(A.call(t,i));break;case"canvas":case"base64":e(function(e){return A.call(this,e).toDataURL(e.format,e.quality)}.call(t,i));break;case"blob":(function(e){var t=this;return new Promise((function(i,n){A.call(t,e).toBlob((function(e){i(e)}),e.format,e.quality)}))}).call(t,i).then(e);break;default:e(function(e){var t=e.points,i=document.createElement("div"),n=document.createElement("img"),o=t[2]-t[0],r=t[3]-t[1];return d(i,"croppie-result"),i.appendChild(n),p(n,{left:-1*t[0]+"px",top:-1*t[1]+"px"}),n.src=e.url,p(i,{width:o+"px",height:r+"px"}),i}.call(t,i))}}))}function D(e){if(!this.options.useCanvas||!this.options.enableOrientation)throw"Croppie: Cannot rotate without enableOrientation && EXIF.js included";var t,i,n,o,r,l=this.elements.canvas;this.data.orientation=(t=this.data.orientation,i=e,o=(n=a.indexOf(t)>-1?a:s).indexOf(t),r=i/90%n.length,n[(n.length+o+r%n.length)%n.length]),x(l,this.elements.img,this.data.orientation),k.call(this),_.call(this),copy=null}if(window.jQuery){var T=window.jQuery;T.fn.croppie=function(e){if("string"==typeof e){var t=Array.prototype.slice.call(arguments,1),i=T(this).data("croppie");return"get"===e?i.get():"result"===e?i.result.apply(i,t):"bind"===e?i.bind.apply(i,t):this.each((function(){var i=T(this).data("croppie");if(i){var n=i[e];if(!T.isFunction(n))throw"Croppie "+e+" method not found";n.apply(i,t),"destroy"===e&&T(this).removeData("croppie")}}))}return this.each((function(){var t=new q(this,e);t.$=T,T(this).data("croppie",t)}))}}function q(e,t){if(e.className.indexOf("croppie-container")>-1)throw new Error("Croppie: Can't initialize croppie more than once");if(this.element=e,this.options=h(u(q.defaults),t),"img"===this.element.tagName.toLowerCase()){var i=this.element;d(i,"cr-original-image"),m(i,{"aria-hidden":"true",alt:""});var n=document.createElement("div");this.element.parentNode.appendChild(n),n.appendChild(i),this.element=n,this.options.url=this.options.url||i.src}if(C.call(this),this.options.url){var o={url:this.options.url,points:this.options.points};delete this.options.url,delete this.options.points,O.call(this,o)}}q.defaults={viewport:{width:100,height:100,type:"square"},boundary:{},orientationControls:{enabled:!0,leftClass:"",rightClass:""},resizeControls:{width:!0,height:!0},customClass:"",showZoomer:!0,enableZoom:!0,enableResize:!1,mouseWheelZoom:!0,enableExif:!1,enforceBoundary:!0,enableOrientation:!1,enableKeyMovement:!0,update:function(){}},q.globals={translate:"translate3d"},h(q.prototype,{bind:function(e,t){return O.call(this,e,t)},get:function(){var e=H.call(this),t=e.points;return this.options.relative&&(t[0]/=this.elements.img.naturalWidth/100,t[1]/=this.elements.img.naturalHeight/100,t[2]/=this.elements.img.naturalWidth/100,t[3]/=this.elements.img.naturalHeight/100),e},result:function(e){return P.call(this,e)},refresh:function(){return function(){W.call(this)}.call(this)},setZoom:function(e){L.call(this,e),c(this.elements.zoomer)},rotate:function(e){D.call(this,e)},destroy:function(){return function(){var e,t;this.element.removeChild(this.elements.boundary),t="croppie-container",(e=this.element).classList?e.classList.remove(t):e.className=e.className.replace(t,""),this.options.enableZoom&&this.element.removeChild(this.elements.zoomerWrap),delete this.elements}.call(this)}}),e.Croppie=window.Croppie=q}));

/* ---------- Vanilla-Picker v2.10.1 ---------- */
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):e.Picker=t()}(this,function(){"use strict";function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var e=function(e,t,r){return t&&i(e.prototype,t),r&&i(e,r),e};function i(e,t){for(var r=0;r<t.length;r++){var i=t[r];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}var h=function(e,t){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return function(e,t){var r=[],i=!0,n=!1,o=void 0;try{for(var a,s=e[Symbol.iterator]();!(i=(a=s.next()).done)&&(r.push(a.value),!t||r.length!==t);i=!0);}catch(e){n=!0,o=e}finally{try{!i&&s.return&&s.return()}finally{if(n)throw o}}return r}(e,t);throw new TypeError("Invalid attempt to destructure non-iterable instance")};String.prototype.startsWith=String.prototype.startsWith||function(e){return 0===this.indexOf(e)},String.prototype.padStart=String.prototype.padStart||function(e,t){for(var r=this;r.length<e;)r=t+r;return r};var n={cb:"0f8ff",tqw:"aebd7",q:"-ffff",qmrn:"7fffd4",zr:"0ffff",bg:"5f5dc",bsq:"e4c4",bck:"---",nch:"ebcd",b:"--ff",bvt:"8a2be2",brwn:"a52a2a",brw:"deb887",ctb:"5f9ea0",hrt:"7fff-",chcT:"d2691e",cr:"7f50",rnw:"6495ed",crns:"8dc",crms:"dc143c",cn:"-ffff",Db:"--8b",Dcn:"-8b8b",Dgnr:"b8860b",Dgr:"a9a9a9",Dgrn:"-64-",Dkhk:"bdb76b",Dmgn:"8b-8b",Dvgr:"556b2f",Drng:"8c-",Drch:"9932cc",Dr:"8b--",Dsmn:"e9967a",Dsgr:"8fbc8f",DsTb:"483d8b",DsTg:"2f4f4f",Dtrq:"-ced1",Dvt:"94-d3",ppnk:"1493",pskb:"-bfff",mgr:"696969",grb:"1e90ff",rbrc:"b22222",rwht:"af0",stg:"228b22",chs:"-ff",gnsb:"dcdcdc",st:"8f8ff",g:"d7-",gnr:"daa520",gr:"808080",grn:"-8-0",grnw:"adff2f",hnw:"0fff0",htpn:"69b4",nnr:"cd5c5c",ng:"4b-82",vr:"0",khk:"0e68c",vnr:"e6e6fa",nrb:"0f5",wngr:"7cfc-",mnch:"acd",Lb:"add8e6",Lcr:"08080",Lcn:"e0ffff",Lgnr:"afad2",Lgr:"d3d3d3",Lgrn:"90ee90",Lpnk:"b6c1",Lsmn:"a07a",Lsgr:"20b2aa",Lskb:"87cefa",LsTg:"778899",Lstb:"b0c4de",Lw:"e0",m:"-ff-",mgrn:"32cd32",nn:"af0e6",mgnt:"-ff",mrn:"8--0",mqm:"66cdaa",mmb:"--cd",mmrc:"ba55d3",mmpr:"9370db",msg:"3cb371",mmsT:"7b68ee","":"-fa9a",mtr:"48d1cc",mmvt:"c71585",mnLb:"191970",ntc:"5fffa",mstr:"e4e1",mccs:"e4b5",vjw:"dead",nv:"--80",c:"df5e6",v:"808-0",vrb:"6b8e23",rng:"a5-",rngr:"45-",rch:"da70d6",pgnr:"eee8aa",pgrn:"98fb98",ptrq:"afeeee",pvtr:"db7093",ppwh:"efd5",pchp:"dab9",pr:"cd853f",pnk:"c0cb",pm:"dda0dd",pwrb:"b0e0e6",prp:"8-080",cc:"663399",r:"--",sbr:"bc8f8f",rb:"4169e1",sbrw:"8b4513",smn:"a8072",nbr:"4a460",sgrn:"2e8b57",ssh:"5ee",snn:"a0522d",svr:"c0c0c0",skb:"87ceeb",sTb:"6a5acd",sTgr:"708090",snw:"afa",n:"-ff7f",stb:"4682b4",tn:"d2b48c",t:"-8080",thst:"d8bfd8",tmT:"6347",trqs:"40e0d0",vt:"ee82ee",whT:"5deb3",wht:"",hts:"5f5f5",w:"-",wgrn:"9acd32"};function a(e,t){var r=1<arguments.length&&void 0!==t?t:1;return(0<r?e.toFixed(r).replace(/0+$/,"").replace(/\.$/,""):e.toString())||"0"}var s=(e(g,[{key:"printRGB",value:function(e){var t=(e?this.rgba:this.rgba.slice(0,3)).map(function(e,t){return a(e,3===t?3:0)});return e?"rgba("+t+")":"rgb("+t+")"}},{key:"printHSL",value:function(e){var r=[360,100,100,1],i=["","%","%",""],t=(e?this.hsla:this.hsla.slice(0,3)).map(function(e,t){return a(e*r[t],3===t?3:1)+i[t]});return e?"hsla("+t+")":"hsl("+t+")"}},{key:"printHex",value:function(e){var t=this.hex;return e?t:t.substring(0,7)}},{key:"rgba",get:function(){if(this._rgba)return this._rgba;if(!this._hsla)throw new Error("No color is set");return this._rgba=g.hslToRgb(this._hsla)},set:function(e){3===e.length&&(e[3]=1),this._rgba=e,this._hsla=null}},{key:"rgbString",get:function(){return this.printRGB()}},{key:"rgbaString",get:function(){return this.printRGB(!0)}},{key:"hsla",get:function(){if(this._hsla)return this._hsla;if(!this._rgba)throw new Error("No color is set");return this._hsla=g.rgbToHsl(this._rgba)},set:function(e){3===e.length&&(e[3]=1),this._hsla=e,this._rgba=null}},{key:"hslString",get:function(){return this.printHSL()}},{key:"hslaString",get:function(){return this.printHSL(!0)}},{key:"hex",get:function(){return"#"+this.rgba.map(function(e,t){return t<3?e.toString(16):Math.round(255*e).toString(16)}).map(function(e){return e.padStart(2,"0")}).join("")},set:function(e){this.rgba=g.hexToRgb(e)}}],[{key:"hexToRgb",value:function(e){var t=(e.startsWith("#")?e.slice(1):e).replace(/^(\w{3})$/,"$1F").replace(/^(\w)(\w)(\w)(\w)$/,"$1$1$2$2$3$3$4$4").replace(/^(\w{6})$/,"$1FF");if(!t.match(/^([0-9a-fA-F]{8})$/))throw new Error("Unknown hex color; "+e);var r=t.match(/^(\w\w)(\w\w)(\w\w)(\w\w)$/).slice(1).map(function(e){return parseInt(e,16)});return r[3]=r[3]/255,r}},{key:"nameToRgb",value:function(e){var t=e.toLowerCase().replace("at","T").replace(/[aeiouyldf]/g,"").replace("ght","L").replace("rk","D").slice(-5,4),r=n[t];return void 0===r?r:g.hexToRgb(r.replace(/\-/g,"00").padStart(6,"f"))}},{key:"rgbToHsl",value:function(e){var t=h(e,4),r=t[0],i=t[1],n=t[2],o=t[3];r/=255,i/=255,n/=255;var a=Math.max(r,i,n),s=Math.min(r,i,n),p=void 0,l=void 0,c=(a+s)/2;if(a===s)p=l=0;else{var u=a-s;switch(l=.5<c?u/(2-a-s):u/(a+s),a){case r:p=(i-n)/u+(i<n?6:0);break;case i:p=(n-r)/u+2;break;case n:p=(r-i)/u+4}p/=6}return[p,l,c,o]}},{key:"hslToRgb",value:function(e){var t=h(e,4),r=t[0],i=t[1],n=t[2],o=t[3],a=void 0,s=void 0,p=void 0;if(0===i)a=s=p=n;else{var l=function(e,t,r){return r<0&&(r+=1),1<r&&(r-=1),r<1/6?e+6*(t-e)*r:r<.5?t:r<2/3?e+(t-e)*(2/3-r)*6:e},c=n<.5?n*(1+i):n+i-n*i,u=2*n-c;a=l(u,c,r+1/3),s=l(u,c,r),p=l(u,c,r-1/3)}var d=[255*a,255*s,255*p].map(Math.round);return d[3]=o,d}}]),g);function g(e,t,r,i){o(this,g);var f=this;if(void 0===e);else if(Array.isArray(e))this.rgba=e;else if(void 0===r){var n=e&&""+e;n&&function(e){if(e.startsWith("hsl")){var t=e.match(/([\-\d\.e]+)/g).map(Number),r=h(t,4),i=r[0],n=r[1],o=r[2],a=r[3];void 0===a&&(a=1),i/=360,n/=100,o/=100,f.hsla=[i,n,o,a]}else if(e.startsWith("rgb")){var s=e.match(/([\-\d\.e]+)/g).map(Number),p=h(s,4),l=p[0],c=p[1],u=p[2],d=p[3];void 0===d&&(d=1),f.rgba=[l,c,u,d]}else e.startsWith("#")?f.rgba=g.hexToRgb(e):f.rgba=g.nameToRgb(e)||g.hexToRgb(e)}(n.toLowerCase())}else this.rgba=[e,t,r,void 0===i?1:i]}var t=(e(p,[{key:"add",value:function(e,t,r){e.addEventListener(t,r,!1),this._events.push({target:e,type:t,handler:r})}},{key:"remove",value:function(r,i,n){this._events=this._events.filter(function(e){var t=!0;return r&&r!==e.target&&(t=!1),i&&i!==e.type&&(t=!1),n&&n!==e.handler&&(t=!1),t&&p._doRemove(e.target,e.type,e.handler),!t})}},{key:"destroy",value:function(){this._events.forEach(function(e){return p._doRemove(e.target,e.type,e.handler)}),this._events=[]}}],[{key:"_doRemove",value:function(e,t,r){e.removeEventListener(t,r,!1)}}]),p);function p(){o(this,p),this._events=[]}function l(e,c,u){var d=!1;function f(e,t,r){return Math.max(t,Math.min(e,r))}function r(e,t,r){if(r&&(d=!0),d){e.preventDefault();var i=c.getBoundingClientRect(),n=i.width,o=i.height,a=t.clientX,s=t.clientY,p=f(a-i.left,0,n),l=f(s-i.top,0,o);u(p/n,l/o)}}function t(e,t){1===(void 0===e.buttons?e.which:e.buttons)?r(e,e,t):d=!1}function i(e,t){1===e.touches.length?r(e,e.touches[0],t):d=!1}e.add(c,"mousedown",function(e){t(e,!0)}),e.add(c,"touchstart",function(e){i(e,!0)}),e.add(window,"mousemove",t),e.add(c,"touchmove",i),e.add(window,"mouseup",function(e){d=!1}),e.add(c,"touchend",function(e){d=!1}),e.add(c,"touchcancel",function(e){d=!1})}var c="keydown",u="mousedown",d="focusin";function v(e,t){return(t||document).querySelector(e)}function f(e){e.preventDefault(),e.stopPropagation()}function b(e,t,r,i,n){e.add(t,c,function(e){0<=r.indexOf(e.key)&&(n&&f(e),i(e))})}var r=document.createElement("style");function m(e){o(this,m),this.settings={popup:"right",layout:"default",alpha:!0,editor:!0,editorFormat:"hex",cancelButton:!1,defaultColor:"#0cf"},this._events=new t,this.onChange=null,this.onDone=null,this.onOpen=null,this.onClose=null,this.setOptions(e)}return r.textContent=".picker_wrapper.no_editor .picker_editor{position:absolute;z-index:-1;opacity:0}.layout_default.picker_wrapper{display:-webkit-box;display:flex;-webkit-box-orient:horizontal;-webkit-box-direction:normal;flex-flow:row wrap;-webkit-box-pack:justify;justify-content:space-between;-webkit-box-align:stretch;align-items:stretch;font-size:10px;width:25em;padding:.5em}.layout_default.picker_wrapper>*{margin:1em;border-radius:5px;}.layout_default.picker_wrapper::before{content:'';display:block;width:100%;height:0;-webkit-box-ordinal-group:2;order:1}.layout_default .picker_slider,.layout_default .picker_selector{padding:1em}.layout_default .picker_hue{width:100%;}.layout_default .picker_sl{-webkit-box-flex:1;flex:1 1 auto}.layout_default .picker_sl::before{content:'';display:block;padding-bottom:100%}.layout_default .picker_editor{-webkit-box-ordinal-group:2;order:1;width:100%}.layout_default .picker_editor input{width:100%;height: 35px;text-align: center;border-radius: 5px;}.layout_default .picker_sample{-webkit-box-ordinal-group:2;order:1;-webkit-box-flex:1;flex:1 1 auto;    width: 100%;height: 35px;}.layout_default .picker_done,.layout_default .picker_cancel{-webkit-box-ordinal-group:2;order:1}.picker_wrapper{box-sizing:border-box;margin:auto;cursor:default;font-family:sans-serif;color:#444;pointer-events:auto}.picker_wrapper:focus{outline:none}.picker_wrapper button,.picker_wrapper input{box-sizing:border-box;border:none;outline:none}.picker_wrapper button{cursor:pointer;}.picker_wrapper button:active{background-image:-webkit-gradient(linear, left bottom, left top, from(transparent), to(gainsboro));background-image:-webkit-linear-gradient(bottom, transparent, gainsboro);background-image:linear-gradient(0deg, transparent, gainsboro)}.picker_selector{position:absolute;z-index:1;display:block;-webkit-transform:translate(-50%, -50%);transform:translate(-50%, -50%);border:2px solid white;border-radius:100%;background:currentColor;cursor:pointer}.picker_slider .picker_selector{border-radius:2px}.picker_hue{position:relative;background-image:-webkit-gradient(linear, left top, right top, from(red), color-stop(yellow), color-stop(lime), color-stop(cyan), color-stop(blue), color-stop(magenta), to(red));background-image:-webkit-linear-gradient(left, red, yellow, lime, cyan, blue, magenta, red);background-image:linear-gradient(90deg, red, yellow, lime, cyan, blue, magenta, red);}.picker_sl{position:relative;background-image:-webkit-gradient(linear, left top, left bottom, from(white), color-stop(50%, rgba(255,255,255,0))),-webkit-gradient(linear, left bottom, left top, from(black), color-stop(50%, rgba(0,0,0,0))),-webkit-gradient(linear, left top, right top, from(gray), to(rgba(128,128,128,0)));background-image:-webkit-linear-gradient(top, white, rgba(255,255,255,0) 50%),-webkit-linear-gradient(bottom, black, rgba(0,0,0,0) 50%),-webkit-linear-gradient(left, gray, rgba(128,128,128,0));background-image:linear-gradient(180deg, white, rgba(255,255,255,0) 50%),linear-gradient(0deg, black, rgba(0,0,0,0) 50%),linear-gradient(90deg, gray, rgba(128,128,128,0))}.picker_alpha,.picker_sample{position:relative;background:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='2' height='2'%3E%3Cpath d='M1,0H0V1H2V2H1' fill='lightgrey'/%3E%3C/svg%3E\") left top/contain white;}.picker_alpha .picker_selector,.picker_sample .picker_selector{background:none}.picker_sample::before{content:'';position:absolute;display:block;width:100%;height:100%;background:currentColor;border-radius:5px;}.picker_arrow{position:absolute;z-index:-1}.picker_wrapper.popup{position:absolute;z-index:2;margin:1.5em}.picker_wrapper.popup,.picker_wrapper.popup .picker_arrow::before,.picker_wrapper.popup .picker_arrow::after{background:#f2f2f2;box-shadow:0 0 10px 1px rgba(0,0,0,0.4)}.picker_wrapper.popup .picker_arrow{width:3em;height:3em;margin:0}.picker_wrapper.popup .picker_arrow::before,.picker_wrapper.popup .picker_arrow::after{content:\"\";display:block;position:absolute;top:0;left:0;z-index:-99}.picker_wrapper.popup .picker_arrow::before{width:100%;height:100%;-webkit-transform:skew(45deg);transform:skew(45deg);-webkit-transform-origin:0 100%;transform-origin:0 100%}.picker_wrapper.popup .picker_arrow::after{width:150%;height:150%;box-shadow:none}.popup.popup_top{bottom:100%;left:0}.popup.popup_top .picker_arrow{bottom:0;left:0;-webkit-transform:rotate(-90deg);transform:rotate(-90deg)}.popup.popup_bottom{top:100%;left:0}.popup.popup_bottom .picker_arrow{top:0;left:0;-webkit-transform:rotate(90deg) scale(1, -1);transform:rotate(90deg) scale(1, -1)}.popup.popup_left{top:0;right:100%}.popup.popup_left .picker_arrow{top:0;right:0;-webkit-transform:scale(-1, 1);transform:scale(-1, 1)}.popup.popup_right{top:0;left:100%}.popup.popup_right .picker_arrow{top:0;left:0}",document.documentElement.firstElementChild.appendChild(r),e(m,[{key:"setOptions",value:function(e){var t=this;if(e){var r=this.settings;if(e instanceof HTMLElement)r.parent=e;else{r.parent&&e.parent&&r.parent!==e.parent&&(this._events.remove(r.parent),this._popupInited=!1),function(e,t,r){for(var i in e)r&&0<=r.indexOf(i)||(t[i]=e[i])}(e,r),e.onChange&&(this.onChange=e.onChange),e.onDone&&(this.onDone=e.onDone),e.onOpen&&(this.onOpen=e.onOpen),e.onClose&&(this.onClose=e.onClose);var i=e.color||e.colour;i&&this._setColor(i)}var n=r.parent;if(n&&r.popup&&!this._popupInited){var o=function(e){return t.openHandler(e)};this._events.add(n,"click",o),b(this._events,n,[" ","Spacebar","Enter"],o),this._popupInited=!0}else e.parent&&!r.popup&&this.show()}}},{key:"openHandler",value:function(e){if(this.show()){e&&e.preventDefault(),this.settings.parent.style.pointerEvents="none";var t=e&&e.type===c?this._domEdit:this.domElement;setTimeout(function(){return t.focus()},100),this.onOpen&&this.onOpen(this.colour)}}},{key:"closeHandler",value:function(e){var t=e&&e.type,r=!1;if(e)if(t===u||t===d){var i=(this.__containedEvent||0)+100;e.timeStamp>i&&(r=!0)}else f(e),r=!0;else r=!0;r&&this.hide()&&(this.settings.parent.style.pointerEvents="",t!==u&&this.settings.parent.focus(),this.onClose&&this.onClose(this.colour))}},{key:"movePopup",value:function(e,t){this.closeHandler(),this.setOptions(e),t&&this.openHandler()}},{key:"setColor",value:function(e,t){this._setColor(e,{silent:t})}},{key:"_setColor",value:function(e,t){if("string"==typeof e&&(e=e.trim()),e){t=t||{};var r=void 0;try{r=new s(e)}catch(e){if(t.failSilently)return;throw e}if(!this.settings.alpha){var i=r.hsla;i[3]=1,r.hsla=i}this.colour=this.color=r,this._setHSLA(null,null,null,null,t)}}},{key:"setColour",value:function(e,t){this.setColor(e,t)}},{key:"show",value:function(){if(!this.settings.parent)return!1;if(this.domElement){var e=this._toggleDOM(!0);return this._setPosition(),e}var t=function(e){var t=document.createElement("div");return t.innerHTML=e,t.firstElementChild}(this.settings.template||'<div class="picker_wrapper" tabindex="-1"><div class="picker_arrow"></div><div class="picker_hue picker_slider"><div class="picker_selector"></div></div><div class="picker_sl"><div class="picker_selector"></div></div><div class="picker_alpha picker_slider"><div class="picker_selector"></div></div><div class="picker_sample"></div><div class="picker_editor"><input aria-label="Type a color name or hex value"/></div><div class="picker_cancel"><button id="close_clvn">Cancel</button></div><div class="picker_done"><button>Ok</button></div></div>');return this.domElement=t,this._domH=v(".picker_hue",t),this._domSL=v(".picker_sl",t),this._domA=v(".picker_alpha",t),this._domEdit=v(".picker_editor input",t),this._domSample=v(".picker_sample",t),this._domOkay=v(".picker_done button",t),this._domCancel=v(".picker_cancel button",t),t.classList.add("layout_"+this.settings.layout),this.settings.alpha||t.classList.add("no_alpha"),this.settings.editor||t.classList.add("no_editor"),this.settings.cancelButton||t.classList.add("no_cancel"),this._ifPopup(function(){return t.classList.add("popup")}),this._setPosition(),this.colour?this._updateUI():this._setColor(this.settings.defaultColor),this._bindEvents(),!0}},{key:"hide",value:function(){return this._toggleDOM(!1)}},{key:"destroy",value:function(){this._events.destroy(),this.domElement&&this.settings.parent.removeChild(this.domElement)}},{key:"_bindEvents",value:function(){var r=this,i=this,n=this.domElement,o=this._events;function a(e,t,r){o.add(e,t,r)}a(n,"click",function(e){return e.preventDefault()}),l(o,this._domH,function(e,t){return i._setHSLA(e)}),l(o,this._domSL,function(e,t){return i._setHSLA(null,e,1-t)}),this.settings.alpha&&l(o,this._domA,function(e,t){return i._setHSLA(null,null,null,1-t)});var e=this._domEdit;function t(e){r._ifPopup(function(){return r.closeHandler(e)}),r.onDone&&r.onDone(r.colour)}a(e,"input",function(e){i._setColor(this.value,{fromEditor:!0,failSilently:!0})}),a(e,"focus",function(e){this.selectionStart===this.selectionEnd&&this.select()}),this._ifPopup(function(){function e(e){return r.closeHandler(e)}function t(e){r.__containedEvent=e.timeStamp}a(window,u,e),a(window,d,e),b(o,n,["Esc","Escape"],e),a(n,u,t),a(n,d,t),a(r._domCancel,"click",e)}),a(this._domOkay,"click",t),b(o,n,["Enter"],t)}},{key:"_setPosition",value:function(){var r=this.settings.parent,i=this.domElement;r!==i.parentNode&&r.appendChild(i),this._ifPopup(function(e){"static"===getComputedStyle(r).position&&(r.style.position="relative");var t=!0===e?"popup_right":"popup_"+e;["popup_top","popup_bottom","popup_left","popup_right"].forEach(function(e){e===t?i.classList.add(e):i.classList.remove(e)}),i.classList.add(t)})}},{key:"_setHSLA",value:function(e,t,r,i,n){n=n||{};var o=this.colour,a=o.hsla;[e,t,r,i].forEach(function(e,t){!e&&0!==e||(a[t]=e)}),o.hsla=a,this._updateUI(n),this.onChange&&!n.silent&&this.onChange(o)}},{key:"_updateUI",value:function(e){if(this.domElement){e=e||{};var t=this.colour,r=t.hsla,i="hsl("+360*r[0]+", 100%, 50%)",n=t.hslString,o=t.hslaString,a=this._domH,s=this._domSL,p=this._domA,l=v(".picker_selector",a),c=v(".picker_selector",s),u=v(".picker_selector",p);k(0,l,r[0]),this._domSL.style.backgroundColor=this._domH.style.color=i,k(0,c,r[1]),_(0,c,1-r[2]),s.style.color=n,_(0,u,1-r[3]);var d=n,f=d.replace("hsl","hsla").replace(")",", 0)"),h="linear-gradient("+[d,f]+")";if(this._domA.style.backgroundImage=h+", url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='2' height='2'%3E%3Cpath d='M1,0H0V1H2V2H1' fill='lightgrey'/%3E%3C/svg%3E\")",!e.fromEditor){var g=this.settings.editorFormat,b=this.settings.alpha,m=void 0;switch(g){case"rgb":m=t.printRGB(b);break;case"hsl":m=t.printHSL(b);break;default:m=t.printHex(b)}this._domEdit.value=m}this._domSample.style.color=o}function k(e,t,r){t.style.left=100*r+"%"}function _(e,t,r){t.style.top=100*r+"%"}}},{key:"_ifPopup",value:function(e,t){this.settings.parent&&this.settings.popup?e&&e(this.settings.popup):t&&t()}},{key:"_toggleDOM",value:function(e){var t=this.domElement;if(!t)return!1;var r=e?"":"none",i=t.style.display!==r;return i&&(t.style.display=r),i}}],[{key:"StyleElement",get:function(){return r}}]),m});

/* ------------------ d3Notif ----------------- */
function Notif(option){
  //Configuration
  var el = this;
  el.self = document.querySelector('.toast-message');
  el.message = document.querySelector('.message');
  el.top = option.topPos;
  el.classNames = option.classNames;
  el.autoClose = (typeof option.autoClose === "boolean")? option.autoClose: false;
  el.autoCloseTimeout = (option.autoClose && typeof option.autoCloseTimeout === "number")? option.autoCloseTimeout: 3000;  
  //Methods
  el.reset = function(){
    (el.message).innerHTML="";
    el.self.classList.remove(el.classNames);
  }
  el.showN = function(msg,type){
    el.reset();
    el.message.innerHTML=msg;
    el.self.style.top= el.top;
    el.self.classList.add(type);
    
    if(el.autoClose){
      setTimeout(function(){
        el.hideN();
      }, el.autoCloseTimeout);
    }
  }
  el.hideN = function(){
    el.self.style.top='-100%';
    el.reset();
  };
}

const cloudsI = '<svg version="1.1" x="0px" y="0px" viewBox="0 0 60.7 40" style="enable-background:new 0 0 60.7 40;" xml:space="preserve"> <g fill="#fff"> <path d="M47.2,40H7.9C3.5,40,0,36.5,0,32.1l0,0c0-4.3,3.5-7.9,7.9-7.9h39.4c4.3,0,7.9,3.5,7.9,7.9v0 C55.1,36.5,51.6,40,47.2,40z"/> <circle cx="17.4" cy="22.8" r="9.3"/> <circle cx="34.5" cy="21.1" r="15.6"/> <animateTransform attributeName="transform" attributeType="XML" dur="6s" keyTimes="0;0.5;1" repeatCount="indefinite" type="translate" values="0;5;0" calcMode="linear"> </animateTransform> </g> <g fill="#ccc"> <path d="M54.7,22.3H33.4c-3.3,0-6-2.7-6-6v0c0-3.3,2.7-6,6-6h21.3c3.3,0,6,2.7,6,6v0 C60.7,19.6,58,22.3,54.7,22.3z"/> <circle cx="45.7" cy="10.7" r="10.7"/> <animateTransform attributeName="transform" attributeType="XML" dur="6s" keyTimes="0;0.5;1" repeatCount="indefinite" type="translate" values="0;-3;0" calcMode="linear"> </animateTransform> </g> </svg>';
const rainyI = '<svg version="1.1" x="0px" y="0px" viewBox="0 0 55.1 60" style="enable-background:new 0 0 55.1 49.5;" xml:space="preserve"> <g fill="#fff"> <path d="M20.7,46.4c0,1.7-1.4,3.1-3.1,3.1s-3.1-1.4-3.1-3.1c0-1.7,3.1-7.8,3.1-7.8 S20.7,44.7,20.7,46.4z"></path> <path d="M31.4,46.4c0,1.7-1.4,3.1-3.1,3.1c-1.7,0-3.1-1.4-3.1-3.1c0-1.7,3.1-7.8,3.1-7.8 S31.4,44.7,31.4,46.4z"> </path> <path d="M41.3,46.4c0,1.7-1.4,3.1-3.1,3.1c-1.7,0-3.1-1.4-3.1-3.1c0-1.7,3.1-7.8,3.1-7.8 S41.3,44.7,41.3,46.4z"> </path> <animateTransform attributeName="transform" attributeType="XML" dur="1s" keyTimes="0;1" repeatCount="indefinite" type="translate" values="0 0;0 10" calcMode="linear"> </animateTransform> <animate attributeType="CSS" attributeName="opacity" attributeType="XML" dur="1s" keyTimes="0;1" repeatCount="indefinite" values="1;0" calcMode="linear"/> </g> <g fill="#fff"> <path d="M47.2,34.5H7.9c-4.3,0-7.9-3.5-7.9-7.9l0,0c0-4.3,3.5-7.9,7.9-7.9h39.4c4.3,0,7.9,3.5,7.9,7.9 v0C55.1,30.9,51.6,34.5,47.2,34.5z"/> <circle cx="17.4" cy="17.3" r="9.3"/> <circle cx="34.5" cy="15.6" r="15.6"/> </g> </svg>';
const crlI = '<svg version="1.1" x="0px" y="0px" viewBox="0 0 60.7 80" style="enable-background:new 0 0 60.7 55;" xml:space="preserve"> <g fill="#999"> <path d="M47.2,40H7.9C3.5,40,0,36.5,0,32.1l0,0c0-4.3,3.5-7.9,7.9-7.9h39.4c4.3,0,7.9,3.5,7.9,7.9v0 C55.1,36.5,51.6,40,47.2,40z"/> <circle cx="17.4" cy="22.8" r="9.3"/> <circle cx="34.5" cy="21.1" r="15.6"/> </g> <g fill="#ccc"> <path d="M54.7,22.3H33.4c-3.3,0-6-2.7-6-6v0c0-3.3,2.7-6,6-6h21.3c3.3,0,6,2.7,6,6v0 C60.7,19.6,58,22.3,54.7,22.3z"/> <circle cx="45.7" cy="10.7" r="10.7"/> <animateTransform attributeName="transform" attributeType="XML" dur="6s" keyTimes="0;0.5;1" repeatCount="indefinite" type="translate" values="0;-3;0" calcMode="linear"> </animateTransform> </g> <g fill="#ff0"> <path d="M43.6,22.7c-0.2,0.6-0.4,1.3-0.6,1.9c-0.2,0.6-0.4,1.2-0.7,1.8c-0.4,1.2-0.9,2.4-1.5,3.5 c-1,2.3-2.2,4.6-3.4,6.8l-1.7-2.9c3.2-0.1,6.3-0.1,9.5,0l3,0.1l-1.3,2.5c-1.1,2.1-2.2,4.2-3.5,6.2c-0.6,1-1.3,2-2,3 c-0.7,1-1.4,2-2.2,2.9c0.2-1.2,0.5-2.4,0.8-3.5c0.3-1.2,0.6-2.3,1-3.4c0.7-2.3,1.5-4.5,2.4-6.7l1.7,2.7c-3.2,0.1-6.3,0.2-9.5,0 l-3.4-0.1l1.8-2.8c1.4-2.1,2.8-4.2,4.3-6.2c0.8-1,1.6-2,2.4-3c0.4-0.5,0.8-1,1.3-1.5C42.7,23.7,43.1,23.2,43.6,22.7z"/> <animate attributeType="CSS" attributeName="opacity" attributeType="XML" dur="3s" keyTimes="0;0.5;1" repeatCount="indefinite" values="1;0;1" calcMode="linear"/> </g> <g fill="#fff"> <path d="M36.3,51.9c0,1.7-1.4,3.1-3.1,3.1c-1.7,0-3.1-1.4-3.1-3.1c0-1.7,3.1-7.8,3.1-7.8 S36.3,50.2,36.3,51.9z"/> <path d="M26.4,51.9c0,1.7-1.4,3.1-3.1,3.1c-1.7,0-3.1-1.4-3.1-3.1c0-1.7,3.1-7.8,3.1-7.8 S26.4,50.2,26.4,51.9z"/> <path d="M15.7,51.9c0,1.7-1.4,3.1-3.1,3.1s-3.1-1.4-3.1-3.1c0-1.7,3.1-7.8,3.1-7.8 S15.7,50.2,15.7,51.9z"/> <animateTransform attributeName="transform" attributeType="XML" dur="1s" keyTimes="0;1" repeatCount="indefinite" type="translate" values="0 0;0 10" calcMode="linear"> </animateTransform> <animate attributeType="CSS" attributeName="opacity" attributeType="XML" dur="1s" keyTimes="0;1" repeatCount="indefinite" values="1;0" calcMode="linear"/> </g> </svg>';
const mist = '<svg version="1.1" x="0px" y="0px" viewBox="0 0 45.1 47.6" style="enable-background:new 0 0 45.1 47.6;" xml:space="preserve"> <g fill="none" stroke="#FFF" stroke-width="2" stroke-miterlimit="10"> <line x1="25.5" y1="17.3" x2="5.3" y2="17.3"/> <line x1="27" y1="20.3" x2="0" y2="20.3"/> <line x1="35" y1="24.3" x2="20" y2="24.3"/> <line x1="40" y1="27.3" x2="15" y2="27.3"/> <line x1="25.5" y1="30.3" x2="5.3" y2="30.3"/> <line x1="27" y1="33.3" x2="0" y2="33.3"/> <line x1="15" y1="36.3" x2="50" y2="36.3"/> <line x1="20" y1="39.3" x2="45" y2="39.3"/> <line x1="10" y1="42.3" x2="35" y2="42.3"/> <line x1="5" y1="45.3" x2="30" y2="45.3"/> <animateTransform attributeName="transform" attributeType="XML" dur="4s" keyTimes="0;0.5;1" repeatCount="indefinite" type="translate" values="5;0;5" calcMode="linear"> </animateTransform> <animate attributeType="CSS" attributeName="opacity" attributeType="XML" dur="4s" keyTimes="0;1" repeatCount="indefinite" values="0.3;3;" calcMode="linear"/> </g> </svg>';
const snowy = '<svg version="1.1" x="0px" y="0px" viewBox="0 0 55.1 52.5" style="enable-background:new 0 0 55.1 52.5;" xml:space="preserve"> <g fill="#fff"> <g> <path d="M47.2,34.5H7.9c-4.3,0-7.9-3.5-7.9-7.9l0,0c0-4.3,3.5-7.9,7.9-7.9h39.4c4.3,0,7.9,3.5,7.9,7.9 v0C55.1,30.9,51.6,34.5,47.2,34.5z"/> <circle cx="17.4" cy="17.3" r="9.3"/> <circle cx="34.5" cy="15.6" r="15.6"/> </g> <circle cx="37" cy="43.5" r="3"> <animateTransform attributeName="transform" attributeType="XML" dur="1.5s" keyTimes="0;0.33;0.66;1" repeatCount="indefinite" type="translate" values="1 -2;3 2; 1 4; 2 6" calcMode="linear"> </animateTransform> </circle> <circle cx="27" cy="43.5" r="3"> <animateTransform attributeName="transform" attributeType="XML" dur="1.5s" keyTimes="0;0.33;0.66;1" repeatCount="indefinite" type="translate" values="1 -2;3 2; 1 4; 2 6" calcMode="linear"> </animateTransform> </circle> <circle cx="17" cy="43.5" r="3"> <animateTransform attributeName="transform" attributeType="XML" dur="1.5s" keyTimes="0;0.33;0.66;1" repeatCount="indefinite" type="translate" values="1 -2;3 2; 1 4; 2 6" calcMode="linear"> </animateTransform> </circle> </g> </svg>';
const icons = {
  '50d': mist,
  '50n': mist,
  '13d': snowy,
  '13n': snowy,
  '11d': crlI,
  '11n': crlI,
  '10d': rainyI,
  '10n': rainyI,
  '09d': rainyI,
  '09n': rainyI,
  '04d': cloudsI,
  '04n': cloudsI,
  '03d': cloudsI,
  '03n': cloudsI,
  '02d': '<svg version="1.1" x="0px" y="0px" viewBox="0 0 61.7 42.8" style="enable-background:new 0 0 61.7 42.8;" xml:space="preserve"> <g fill="#fff"> <path d="M47.2,42.8H7.9c-4.3,0-7.9-3.5-7.9-7.9l0,0C0,30.5,3.5,27,7.9,27h39.4c4.3,0,7.9,3.5,7.9,7.9 v0C55.1,39.2,51.6,42.8,47.2,42.8z"/> <circle cx="17.4" cy="25.5" r="9.3"/> <circle cx="34.5" cy="23.9" r="15.6"/> <animateTransform attributeName="transform" attributeType="XML" dur="6s" keyTimes="0;0.5;1" repeatCount="indefinite" type="translate" values="0;5;0" calcMode="linear"> </animateTransform> </g> <g fill="#ff0"> <circle cx="31.4" cy="18.5" r="9"/> <g> <path d="M31.4,6.6L31.4,6.6c-0.4,0-0.6-0.3-0.6-0.6V0.6C30.8,0.3,31,0,31.3,0l0.1,0 C31.7,0,32,0.3,32,0.6v5.5C32,6.4,31.7,6.6,31.4,6.6z"/> <path d="M31.4,30.1L31.4,30.1c-0.4,0-0.6,0.3-0.6,0.6v5.5c0,0.3,0.3,0.6,0.6,0.6h0.1 c0.3,0,0.6-0.3,0.6-0.6v-5.5C32,30.4,31.7,30.1,31.4,30.1z"/> <path d="M19.6,18.3L19.6,18.3c0,0.4-0.3,0.6-0.6,0.6h-5.5c-0.3,0-0.6-0.3-0.6-0.6v-0.1 c0-0.3,0.3-0.6,0.6-0.6H19C19.3,17.8,19.6,18,19.6,18.3z"/> <path d="M43.1,18.3L43.1,18.3c0,0.4,0.3,0.6,0.6,0.6h5.5c0.3,0,0.6-0.3,0.6-0.6v-0.1 c0-0.3-0.3-0.6-0.6-0.6h-5.5C43.4,17.8,43.1,18,43.1,18.3z"/> <path d="M22.4,26L22.4,26c0.3,0.3,0.2,0.7,0,0.9l-4.2,3.6c-0.2,0.2-0.6,0.2-0.8-0.1l-0.1-0.1 c-0.2-0.2-0.2-0.6,0.1-0.8l4.2-3.6C21.9,25.8,22.2,25.8,22.4,26z"/> <path d="M40.3,10.7L40.3,10.7c0.3,0.3,0.6,0.3,0.8,0.1l4.2-3.6c0.2-0.2,0.3-0.6,0.1-0.8l-0.1-0.1 c-0.2-0.2-0.6-0.3-0.8-0.1l-4.2,3.6C40.1,10.1,40,10.5,40.3,10.7z"/> <path d="M22.4,10.8L22.4,10.8c0.3-0.3,0.2-0.7,0-0.9l-4.2-3.6c-0.2-0.2-0.6-0.2-0.8,0.1l-0.1,0.1 c-0.2,0.2-0.2,0.6,0.1,0.8l4.2,3.6C21.9,11,22.2,11,22.4,10.8z"/> <path d="M40.3,26.1L40.3,26.1c0.3-0.3,0.6-0.3,0.8-0.1l4.2,3.6c0.2,0.2,0.3,0.6,0.1,0.8l-0.1,0.1 c-0.2,0.2-0.6,0.3-0.8,0.1l-4.2-3.6C40.1,26.7,40,26.3,40.3,26.1z"/> <animate attributeType="CSS" attributeName="opacity" attributeType="XML" dur="0.5s" keyTimes="0;0.5;1" repeatCount="indefinite" values="1;0.6;1" calcMode="linear"/> </g> <animateTransform attributeName="transform" attributeType="XML" dur="2s" keyTimes="0;1" repeatCount="indefinite" type="scale" values="1;1" calcMode="linear"> </animateTransform> </g> <g fill="#ccc"> <path d="M55.7,25.1H34.4c-3.3,0-6-2.7-6-6v0c0-3.3,2.7-6,6-6h21.3c3.3,0,6,2.7,6,6v0 C61.7,22.4,59,25.1,55.7,25.1z"/> <circle cx="46.7" cy="13.4" r="10.7"/> <animateTransform attributeName="transform" attributeType="XML" dur="6s" keyTimes="0;0.5;1" repeatCount="indefinite" type="translate" values="0;-3;0" calcMode="linear"> </animateTransform> </g> </svg>',
  '02n': '<svg version="1.1" x="0px" y="0px" viewBox="0 0 60.7 44.4" style="enable-background:new 0 0 60.7 44.4;" xml:space="preserve"> <g fill="#fff"> <path d="M47.2,44.4H7.9c-4.3,0-7.9-3.5-7.9-7.9l0,0c0-4.3,3.5-7.9,7.9-7.9h39.4c4.3,0,7.9,3.5,7.9,7.9 v0C55.1,40.9,51.6,44.4,47.2,44.4z"/> <circle cx="17.4" cy="27.2" r="9.3"/> <circle cx="34.5" cy="25.5" r="15.6"/> <animateTransform attributeName="transform" attributeType="XML" dur="6s" keyTimes="0;0.5;1" repeatCount="indefinite" type="translate" values="0;5;0" calcMode="linear"> </animateTransform> </g> <path fill="#ff0" d="M33.6,17.9c-0.2-7.7,4.9-14.4,12-16.4c-2.3-1-4.9-1.5-7.6-1.5c-9.8,0.3-17.5,8.5-17.2,18.3 c0.3,9.8,8.5,17.5,18.3,17.2c2.7-0.1,5.2-0.8,7.5-1.9C39.3,32,33.8,25.6,33.6,17.9z"/> <g fill="#ccc"> <path d="M54.7,26.8H33.4c-3.3,0-6-2.7-6-6v0c0-3.3,2.7-6,6-6h21.3c3.3,0,6,2.7,6,6v0 C60.7,24.1,58,26.8,54.7,26.8z"/> <circle cx="45.7" cy="15.1" r="10.7"/> <animateTransform attributeName="transform" attributeType="XML" dur="6s" keyTimes="0;0.5;1" repeatCount="indefinite" type="translate" values="0;-3;0" calcMode="linear"> </animateTransform> </g> </svg>',
  '01d': '<svg version="1.1" x="0px" y="0px" viewBox="0 0 44.9 44.9" xml:space="preserve"> <g fill="#ff0"> <circle cx="22.4" cy="22.6" r="11"/> <g> <path d="M22.6,8.1h-0.3c-0.3,0-0.6-0.3-0.6-0.6v-7c0-0.3,0.3-0.6,0.6-0.6l0.3,0c0.3,0,0.6,0.3,0.6,0.6 v7C23.2,7.8,22.9,8.1,22.6,8.1z"/> <path d="M22.6,36.8h-0.3c-0.3,0-0.6,0.3-0.6,0.6v7c0,0.3,0.3,0.6,0.6,0.6h0.3c0.3,0,0.6-0.3,0.6-0.6v-7 C23.2,37,22.9,36.8,22.6,36.8z"/> <path d="M8.1,22.3v0.3c0,0.3-0.3,0.6-0.6,0.6h-7c-0.3,0-0.6-0.3-0.6-0.6l0-0.3c0-0.3,0.3-0.6,0.6-0.6h7 C7.8,21.7,8.1,21.9,8.1,22.3z"/> <path d="M36.8,22.3v0.3c0,0.3,0.3,0.6,0.6,0.6h7c0.3,0,0.6-0.3,0.6-0.6v-0.3c0-0.3-0.3-0.6-0.6-0.6h-7 C37,21.7,36.8,21.9,36.8,22.3z"/> <path d="M11.4,31.6l0.2,0.3c0.2,0.2,0.2,0.6-0.1,0.8l-5.3,4.5c-0.2,0.2-0.6,0.2-0.8-0.1l-0.2-0.3 c-0.2-0.2-0.2-0.6,0.1-0.8l5.3-4.5C10.9,31.4,11.2,31.4,11.4,31.6z"/> <path d="M33.2,13l0.2,0.3c0.2,0.2,0.6,0.3,0.8,0.1l5.3-4.5c0.2-0.2,0.3-0.6,0.1-0.8l-0.2-0.3 c-0.2-0.2-0.6-0.3-0.8-0.1l-5.3,4.5C33,12.4,33,12.7,33.2,13z"/> <path d="M11.4,13.2l0.2-0.3c0.2-0.2,0.2-0.6-0.1-0.8L6.3,7.6C6.1,7.4,5.7,7.5,5.5,7.7L5.3,7.9 C5.1,8.2,5.1,8.5,5.4,8.7l5.3,4.5C10.9,13.5,11.2,13.5,11.4,13.2z"/> <path d="M33.2,31.9l0.2-0.3c0.2-0.2,0.6-0.3,0.8-0.1l5.3,4.5c0.2,0.2,0.3,0.6,0.1,0.8l-0.2,0.3 c-0.2,0.2-0.6,0.3-0.8,0.1l-5.3-4.5C33,32.5,33,32.1,33.2,31.9z"/> <animate attributeType="CSS" attributeName="opacity" attributeType="XML" dur="0.5s" keyTimes="0;0.5;1" repeatCount="indefinite" values="1;0.6;1" calcMode="linear"/> </g> </g> </svg>',
  '01n': '<svg version="1.1" x="0px" y="0px" viewBox="0 0 30.8 42.5" xml:space="preserve" > <path fill="#ff0" d="M15.3,21.4C15,12.1,21.1,4.2,29.7,1.7c-2.8-1.2-5.8-1.8-9.1-1.7C8.9,0.4-0.3,10.1,0,21.9 c0.3,11.7,10.1,20.9,21.9,20.6c3.2-0.1,6.3-0.9,8.9-2.3C22.2,38.3,15.6,30.7,15.3,21.4z"/> </svg>'
};
var ntp_icons={
  "save":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M433.941 129.941l-83.882-83.882A48 48 0 0 0 316.118 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V163.882a48 48 0 0 0-14.059-33.941zM272 80v80H144V80h128zm122 352H54a6 6 0 0 1-6-6V86a6 6 0 0 1 6-6h42v104c0 13.255 10.745 24 24 24h176c13.255 0 24-10.745 24-24V83.882l78.243 78.243a6 6 0 0 1 1.757 4.243V426a6 6 0 0 1-6 6zM224 232c-48.523 0-88 39.477-88 88s39.477 88 88 88 88-39.477 88-88-39.477-88-88-88zm0 128c-22.056 0-40-17.944-40-40s17.944-40 40-40 40 17.944 40 40-17.944 40-40 40z"/></svg>',
  "info-square":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M400 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V80c0-26.51-21.49-48-48-48zm16 400c0 8.822-7.178 16-16 16H48c-8.822 0-16-7.178-16-16V80c0-8.822 7.178-16 16-16h352c8.822 0 16 7.178 16 16v352zm-228-80h12V232h-12c-6.627 0-12-5.373-12-12v-8c0-6.627 5.373-12 12-12h48c6.627 0 12 5.373 12 12v140h12c6.627 0 12 5.373 12 12v8c0 6.627-5.373 12-12 12h-72c-6.627 0-12-5.373-12-12v-8c0-6.627 5.373-12 12-12zm36-240c-17.673 0-32 14.327-32 32s14.327 32 32 32 32-14.327 32-32-14.327-32-32-32z"/></svg>',
  "redo-alt":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M483.515 28.485L431.35 80.65C386.475 35.767 324.485 8 256.001 8 119.34 8 7.9 119.525 8 256.185 8.1 393.067 119.095 504 256 504c63.926 0 122.202-24.187 166.178-63.908 5.113-4.618 5.353-12.561.482-17.433l-19.738-19.738c-4.498-4.498-11.753-4.785-16.501-.552C351.787 433.246 306.105 452 256 452c-108.321 0-196-87.662-196-196 0-108.321 87.662-196 196-196 54.163 0 103.157 21.923 138.614 57.386l-54.128 54.129c-7.56 7.56-2.206 20.485 8.485 20.485H492c6.627 0 12-5.373 12-12V36.971c0-10.691-12.926-16.045-20.485-8.486z"/></svg>',
  "window-alt":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M464 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h416c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zm-80 80c0-17.7 14.3-32 32-32s32 14.3 32 32-14.3 32-32 32-32-14.3-32-32zm-96 0c0-17.7 14.3-32 32-32s32 14.3 32 32-14.3 32-32 32-32-14.3-32-32zm-96 0c0-17.7 14.3-32 32-32s32 14.3 32 32-14.3 32-32 32-32-14.3-32-32zm272 314c0 3.3-2.7 6-6 6H54c-3.3 0-6-2.7-6-6V192h416v234z"/></svg>',
  "cloud-sun":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path d="M543.7 304.3C539.8 259.4 502 224 456 224c-17.8 0-34.8 5.3-49.2 15.2-22.5-29.5-57.3-47.2-94.8-47.2-66.2 0-120 53.8-120 120v.4c-38.3 16-64 53.5-64 95.6 0 57.3 46.7 104 104 104h304c57.3 0 104-46.7 104-104 0-54.8-42.6-99.8-96.3-103.7zM536 480H232c-39.7 0-72-32.3-72-72 0-32.3 21.9-60.7 53.3-69.2l13.3-3.6-2-17.2c-.3-2-.6-4-.6-6 0-48.5 39.5-88 88-88 32.2 0 61.8 17.9 77.2 46.8l10.6 19.8 15.2-16.5c10.8-11.7 25.4-18.1 41-18.1 30.9 0 56 25.1 56 56 0 1.6-.3 3.1-.8 6.9l-2.5 20 23.5-2.4c1.2-.2 2.5-.4 3.8-.4 39.7 0 72 32.3 72 72S575.7 480 536 480zM92.6 323l12.5-63.2c1.2-6.3-1.4-12.8-6.8-16.4l-53.5-35.8 53.5-35.8c5.4-3.6 8-10.1 6.8-16.4L92.6 92.1l63.2 12.5c6.4 1.3 12.8-1.5 16.4-6.8L208 44.3l35.8 53.5c3.6 5.3 9.9 8.1 16.4 6.8l63.2-12.5-12.5 63.2c-.3 1.6-.1 3.2 0 4.8.4 0 .7-.1 1.1-.1 10.1 0 20 1.1 29.6 3 .2-.5.5-.9.6-1.5l17.2-86.7c1-5.2-.6-10.6-4.4-14.4s-9.2-5.5-14.4-4.4l-76.2 15.1-43.1-64.4c-6-8.9-20.6-8.9-26.6 0l-43.2 64.5-76.1-15.1c-5.3-1.1-10.7.6-14.4 4.4-3.8 3.8-5.4 9.2-4.4 14.4l15.1 76.2-64.6 43.1c-4.4 3-7.1 8-7.1 13.3s2.7 10.3 7.1 13.3L71.6 264l-15.1 76.2c-1 5.2.6 10.6 4.4 14.4 3 3 7.1 4.7 11.3 4.7 1 0 2.1-.1 3.1-.3l32.8-6.5c6.2-13.8 14.6-26.5 25.1-37.6L92.6 323zM208 149.7c18.5 0 34.8 8.9 45.4 22.4 10.2-4.3 20.8-7.6 31.9-9.6-15.6-26.6-44.2-44.8-77.3-44.8-49.5 0-89.8 40.3-89.8 89.8 0 33 18.1 61.7 44.8 77.3 2-11.1 5.3-21.7 9.6-31.9-13.6-10.6-22.4-26.9-22.4-45.4 0-31.8 25.9-57.8 57.8-57.8z"/></svg>',
  "search":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M508.5 468.9L387.1 347.5c-2.3-2.3-5.3-3.5-8.5-3.5h-13.2c31.5-36.5 50.6-84 50.6-136C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c52 0 99.5-19.1 136-50.6v13.2c0 3.2 1.3 6.2 3.5 8.5l121.4 121.4c4.7 4.7 12.3 4.7 17 0l22.6-22.6c4.7-4.7 4.7-12.3 0-17zM208 368c-88.4 0-160-71.6-160-160S119.6 48 208 48s160 71.6 160 160-71.6 160-160 160z"/></svg>',
  "image":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M464 64H48C21.49 64 0 85.49 0 112v288c0 26.51 21.49 48 48 48h416c26.51 0 48-21.49 48-48V112c0-26.51-21.49-48-48-48zm16 336c0 8.822-7.178 16-16 16H48c-8.822 0-16-7.178-16-16V112c0-8.822 7.178-16 16-16h416c8.822 0 16 7.178 16 16v288zM112 232c30.928 0 56-25.072 56-56s-25.072-56-56-56-56 25.072-56 56 25.072 56 56 56zm0-80c13.234 0 24 10.766 24 24s-10.766 24-24 24-24-10.766-24-24 10.766-24 24-24zm207.029 23.029L224 270.059l-31.029-31.029c-9.373-9.373-24.569-9.373-33.941 0l-88 88A23.998 23.998 0 0 0 64 344v28c0 6.627 5.373 12 12 12h360c6.627 0 12-5.373 12-12v-92c0-6.365-2.529-12.47-7.029-16.971l-88-88c-9.373-9.372-24.569-9.372-33.942 0zM416 352H96v-4.686l80-80 48 48 112-112 80 80V352z"/></svg>',
  "list-ol":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M61.77 401l17.5-20.15a19.92 19.92 0 0 0 5.07-14.19v-3.31C84.34 356 80.5 352 73 352H16a8 8 0 0 0-8 8v16a8 8 0 0 0 8 8h22.84a154.82 154.82 0 0 0-11 12.31l-5.61 7c-4 5.07-5.25 10.13-2.8 14.88l1.05 1.93c3 5.76 6.3 7.88 12.25 7.88h4.73c10.33 0 15.94 2.44 15.94 9.09 0 4.72-4.2 8.22-14.36 8.22a41.54 41.54 0 0 1-15.47-3.12c-6.49-3.88-11.74-3.5-15.6 3.12l-5.59 9.31c-3.73 6.13-3.2 11.72 2.62 15.94 7.71 4.69 20.39 9.44 37 9.44 34.16 0 48.5-22.75 48.5-44.12-.03-14.38-9.12-29.76-28.73-34.88zM496 392H176a16 16 0 0 0-16 16v16a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16v-16a16 16 0 0 0-16-16zm0-320H176a16 16 0 0 0-16 16v16a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16V88a16 16 0 0 0-16-16zm0 160H176a16 16 0 0 0-16 16v16a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16v-16a16 16 0 0 0-16-16zM16 160h64a8 8 0 0 0 8-8v-16a8 8 0 0 0-8-8H64V40a8 8 0 0 0-8-8H32a8 8 0 0 0-7.14 4.42l-8 16A8 8 0 0 0 24 64h8v64H16a8 8 0 0 0-8 8v16a8 8 0 0 0 8 8zm-3.9 160H80a8 8 0 0 0 8-8v-16a8 8 0 0 0-8-8H41.33c3.28-10.29 48.33-18.68 48.33-56.44 0-29.06-25-39.56-44.47-39.56-21.36 0-33.8 10-40.45 18.75-4.38 5.59-3 10.84 2.79 15.37l8.58 6.88c5.61 4.56 11 2.47 16.13-2.44a13.4 13.4 0 0 1 9.45-3.84c3.33 0 9.28 1.56 9.28 8.75C51 248.19 0 257.31 0 304.59v4C0 316 5.08 320 12.1 320z"/></svg>',
  "excl-triangle":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M248.747 204.705l6.588 112c.373 6.343 5.626 11.295 11.979 11.295h41.37a12 12 0 0 0 11.979-11.295l6.588-112c.405-6.893-5.075-12.705-11.979-12.705h-54.547c-6.903 0-12.383 5.812-11.978 12.705zM330 384c0 23.196-18.804 42-42 42s-42-18.804-42-42 18.804-42 42-42 42 18.804 42 42zm-.423-360.015c-18.433-31.951-64.687-32.009-83.154 0L6.477 440.013C-11.945 471.946 11.118 512 48.054 512H527.94c36.865 0 60.035-39.993 41.577-71.987L329.577 23.985zM53.191 455.002L282.803 57.008c2.309-4.002 8.085-4.002 10.394 0l229.612 397.993c2.308 4-.579 8.998-5.197 8.998H58.388c-4.617.001-7.504-4.997-5.197-8.997z"/></svg>',
  "plus":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M368 224H224V80c0-8.84-7.16-16-16-16h-32c-8.84 0-16 7.16-16 16v144H16c-8.84 0-16 7.16-16 16v32c0 8.84 7.16 16 16 16h144v144c0 8.84 7.16 16 16 16h32c8.84 0 16-7.16 16-16V288h144c8.84 0 16-7.16 16-16v-32c0-8.84-7.16-16-16-16z"/></svg>',
  "humidity":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M160 292c0-15.5-12.5-28-28-28s-28 12.5-28 28 12.5 28 28 28 28-12.5 28-28zm92 60c-15.5 0-28 12.5-28 28s12.5 28 28 28 28-12.5 28-28-12.5-28-28-28zM223.9 22.1C219.5 7.5 205.8 0 192 0c-13.5 0-27 7.2-31.8 22.1C109.1 179.8 0 222.7 0 333.9 0 432.3 85.9 512 192 512s192-79.7 192-178.1c0-111.7-108.9-153.3-160.1-311.8zM192 480c-88.2 0-160-65.5-160-146.1 0-47.6 25-80.4 59.6-125.9 32.6-42.8 73.1-96 98.6-175.7.1-.1.8-.3 1.8-.3.7 0 1.2.1 1.4.1h.1c26 80.4 66.5 133.4 99.1 176.1C327.1 253.4 352 286 352 333.9c0 80.6-71.8 146.1-160 146.1zm61-212.2l-12.5-10c-3.5-2.8-8.5-2.2-11.2 1.2l-99.5 134c-2.8 3.5-2.2 8.5 1.2 11.2l12.5 10c3.5 2.8 8.5 2.2 11.2-1.2l99.5-134c2.8-3.4 2.2-8.5-1.2-11.2z"/></svg>',
  "rectangle-wide":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path d="M592 416H48c-26.5 0-48-21.5-48-48V144c0-26.5 21.5-48 48-48h544c26.5 0 48 21.5 48 48v224c0 26.5-21.5 48-48 48z"/></svg>',
  "arrows":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M360.549 412.216l-96.064 96.269c-4.686 4.686-12.284 4.686-16.971 0l-96.064-96.269c-4.686-4.686-4.686-12.284 0-16.971l19.626-19.626c4.753-4.753 12.484-4.675 17.14.173L230 420.78h2V280H91.22v2l44.986 41.783c4.849 4.656 4.927 12.387.173 17.14l-19.626 19.626c-4.686 4.686-12.284 4.686-16.971 0L3.515 264.485c-4.686-4.686-4.686-12.284 0-16.971l96.269-96.064c4.686-4.686 12.284-4.686 16.97 0l19.626 19.626c4.753 4.753 4.675 12.484-.173 17.14L91.22 230v2H232V91.22h-2l-41.783 44.986c-4.656 4.849-12.387 4.927-17.14.173l-19.626-19.626c-4.686-4.686-4.686-12.284 0-16.971l96.064-96.269c4.686-4.686 12.284-4.686 16.971 0l96.064 96.269c4.686 4.686 4.686 12.284 0 16.971l-19.626 19.626c-4.753 4.753-12.484 4.675-17.14-.173L282 91.22h-2V232h140.78v-2l-44.986-41.783c-4.849-4.656-4.927-12.387-.173-17.14l19.626-19.626c4.686-4.686 12.284-4.686 16.971 0l96.269 96.064c4.686 4.686 4.686 12.284 0 16.971l-96.269 96.064c-4.686 4.686-12.284 4.686-16.971 0l-19.626-19.626c-4.753-4.753-4.675-12.484.173-17.14L420.78 282v-2H280v140.78h2l41.783-44.986c4.656-4.849 12.387-4.927 17.14-.173l19.626 19.626c4.687 4.685 4.687 12.283 0 16.969z"/></svg>',
  "links":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M314.222 197.78c51.091 51.091 54.377 132.287 9.75 187.16-6.242 7.73-2.784 3.865-84.94 86.02-54.696 54.696-143.266 54.745-197.99 0-54.711-54.69-54.734-143.255 0-197.99 32.773-32.773 51.835-51.899 63.409-63.457 7.463-7.452 20.331-2.354 20.486 8.192a173.31 173.31 0 0 0 4.746 37.828c.966 4.029-.272 8.269-3.202 11.198L80.632 312.57c-32.755 32.775-32.887 85.892 0 118.8 32.775 32.755 85.892 32.887 118.8 0l75.19-75.2c32.718-32.725 32.777-86.013 0-118.79a83.722 83.722 0 0 0-22.814-16.229c-4.623-2.233-7.182-7.25-6.561-12.346 1.356-11.122 6.296-21.885 14.815-30.405l4.375-4.375c3.625-3.626 9.177-4.594 13.76-2.294 12.999 6.524 25.187 15.211 36.025 26.049zM470.958 41.04c-54.724-54.745-143.294-54.696-197.99 0-82.156 82.156-78.698 78.29-84.94 86.02-44.627 54.873-41.341 136.069 9.75 187.16 10.838 10.838 23.026 19.525 36.025 26.049 4.582 2.3 10.134 1.331 13.76-2.294l4.375-4.375c8.52-8.519 13.459-19.283 14.815-30.405.621-5.096-1.938-10.113-6.561-12.346a83.706 83.706 0 0 1-22.814-16.229c-32.777-32.777-32.718-86.065 0-118.79l75.19-75.2c32.908-32.887 86.025-32.755 118.8 0 32.887 32.908 32.755 86.025 0 118.8l-45.848 45.84c-2.93 2.929-4.168 7.169-3.202 11.198a173.31 173.31 0 0 1 4.746 37.828c.155 10.546 13.023 15.644 20.486 8.192 11.574-11.558 30.636-30.684 63.409-63.457 54.733-54.735 54.71-143.3-.001-197.991z"/></svg>',
  "sticky_note":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M448 348.106V80c0-26.51-21.49-48-48-48H48C21.49 32 0 53.49 0 80v351.988c0 26.51 21.49 48 48 48h268.118a48 48 0 0 0 33.941-14.059l83.882-83.882A48 48 0 0 0 448 348.106zm-128 80v-76.118h76.118L320 428.106zM400 80v223.988H296c-13.255 0-24 10.745-24 24v104H48V80h352z"/></svg>',
  "cog":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M452.515 237l31.843-18.382c9.426-5.441 13.996-16.542 11.177-27.054-11.404-42.531-33.842-80.547-64.058-110.797-7.68-7.688-19.575-9.246-28.985-3.811l-31.785 18.358a196.276 196.276 0 0 0-32.899-19.02V39.541a24.016 24.016 0 0 0-17.842-23.206c-41.761-11.107-86.117-11.121-127.93-.001-10.519 2.798-17.844 12.321-17.844 23.206v36.753a196.276 196.276 0 0 0-32.899 19.02l-31.785-18.358c-9.41-5.435-21.305-3.877-28.985 3.811-30.216 30.25-52.654 68.265-64.058 110.797-2.819 10.512 1.751 21.613 11.177 27.054L59.485 237a197.715 197.715 0 0 0 0 37.999l-31.843 18.382c-9.426 5.441-13.996 16.542-11.177 27.054 11.404 42.531 33.842 80.547 64.058 110.797 7.68 7.688 19.575 9.246 28.985 3.811l31.785-18.358a196.202 196.202 0 0 0 32.899 19.019v36.753a24.016 24.016 0 0 0 17.842 23.206c41.761 11.107 86.117 11.122 127.93.001 10.519-2.798 17.844-12.321 17.844-23.206v-36.753a196.34 196.34 0 0 0 32.899-19.019l31.785 18.358c9.41 5.435 21.305 3.877 28.985-3.811 30.216-30.25 52.654-68.266 64.058-110.797 2.819-10.512-1.751-21.613-11.177-27.054L452.515 275c1.22-12.65 1.22-25.35 0-38zm-52.679 63.019l43.819 25.289a200.138 200.138 0 0 1-33.849 58.528l-43.829-25.309c-31.984 27.397-36.659 30.077-76.168 44.029v50.599a200.917 200.917 0 0 1-67.618 0v-50.599c-39.504-13.95-44.196-16.642-76.168-44.029l-43.829 25.309a200.15 200.15 0 0 1-33.849-58.528l43.819-25.289c-7.63-41.299-7.634-46.719 0-88.038l-43.819-25.289c7.85-21.229 19.31-41.049 33.849-58.529l43.829 25.309c31.984-27.397 36.66-30.078 76.168-44.029V58.845a200.917 200.917 0 0 1 67.618 0v50.599c39.504 13.95 44.196 16.642 76.168 44.029l43.829-25.309a200.143 200.143 0 0 1 33.849 58.529l-43.819 25.289c7.631 41.3 7.634 46.718 0 88.037zM256 160c-52.935 0-96 43.065-96 96s43.065 96 96 96 96-43.065 96-96-43.065-96-96-96zm0 144c-26.468 0-48-21.532-48-48 0-26.467 21.532-48 48-48s48 21.533 48 48c0 26.468-21.532 48-48 48z"/></svg>',
  "pencil":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M402.6 83.2l90.2 90.2c3.8 3.8 3.8 10 0 13.8L274.4 405.6l-92.8 10.3c-12.4 1.4-22.9-9.1-21.5-21.5l10.3-92.8L388.8 83.2c3.8-3.8 10-3.8 13.8 0zm162-22.9l-48.8-48.8c-15.2-15.2-39.9-15.2-55.2 0l-35.4 35.4c-3.8 3.8-3.8 10 0 13.8l90.2 90.2c3.8 3.8 10 3.8 13.8 0l35.4-35.4c15.2-15.3 15.2-40 0-55.2zM384 346.2V448H64V128h229.8c3.2 0 6.2-1.3 8.5-3.5l40-40c7.6-7.6 2.2-20.5-8.5-20.5H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V306.2c0-10.7-12.9-16-20.5-8.5l-40 40c-2.2 2.3-3.5 5.3-3.5 8.5z"/></svg>',
  "out":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M24 32h336c13.3 0 24 10.7 24 24v24c0 13.3-10.7 24-24 24H24C10.7 104 0 93.3 0 80V56c0-13.3 10.7-24 24-24zm269.6 263.5L228 361.1V152c0-13.3-10.7-24-24-24h-24c-13.3 0-24 10.7-24 24v209.1l-65.6-65.6c-9.4-9.4-24.6-9.4-33.9 0l-17 17c-9.4 9.4-9.4 24.6 0 33.9L175 481.9c9.4 9.4 24.6 9.4 33.9 0l135.5-135.5c9.4-9.4 9.4-24.6 0-33.9l-17-17c-9.3-9.4-24.5-9.4-33.8 0z"/></svg>',
  "bin":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M268 416h24a12 12 0 0 0 12-12V188a12 12 0 0 0-12-12h-24a12 12 0 0 0-12 12v216a12 12 0 0 0 12 12zM432 80h-82.4l-34-56.7A48 48 0 0 0 274.4 0H173.6a48 48 0 0 0-41.2 23.3L98.4 80H16A16 16 0 0 0 0 96v16a16 16 0 0 0 16 16h16v336a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128h16a16 16 0 0 0 16-16V96a16 16 0 0 0-16-16zM171.8 50.9A6 6 0 0 1 177 48h94a6 6 0 0 1 5.2 2.9L293.6 80H154.4zM368 464H80V128h288zm-212-48h24a12 12 0 0 0 12-12V188a12 12 0 0 0-12-12h-24a12 12 0 0 0-12 12v216a12 12 0 0 0 12 12z"/></svg>',
  "caret-up":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M288.662 352H31.338c-17.818 0-26.741-21.543-14.142-34.142l128.662-128.662c7.81-7.81 20.474-7.81 28.284 0l128.662 128.662c12.6 12.599 3.676 34.142-14.142 34.142z"/></svg>',
  "sync":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M483.515 28.485L431.35 80.65C386.475 35.767 324.485 8 256 8 123.228 8 14.824 112.338 8.31 243.493 7.971 250.311 13.475 256 20.301 256h28.045c6.353 0 11.613-4.952 11.973-11.294C66.161 141.649 151.453 60 256 60c54.163 0 103.157 21.923 138.614 57.386l-54.128 54.129c-7.56 7.56-2.206 20.485 8.485 20.485H492c6.627 0 12-5.373 12-12V36.971c0-10.691-12.926-16.045-20.485-8.486zM491.699 256h-28.045c-6.353 0-11.613 4.952-11.973 11.294C445.839 370.351 360.547 452 256 452c-54.163 0-103.157-21.923-138.614-57.386l54.128-54.129c7.56-7.56 2.206-20.485-8.485-20.485H20c-6.627 0-12 5.373-12 12v143.029c0 10.691 12.926 16.045 20.485 8.485L80.65 431.35C125.525 476.233 187.516 504 256 504c132.773 0 241.176-104.338 247.69-235.493.339-6.818-5.165-12.507-11.991-12.507z"/></svg>',
  "stream":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M16 128h416c8.8 0 16-7.2 16-16V48c0-8.8-7.2-16-16-16H16C7.2 32 0 39.2 0 48v64c0 8.8 7.2 16 16 16zm480 80H80c-8.8 0-16 7.2-16 16v64c0 8.8 7.2 16 16 16h416c8.8 0 16-7.2 16-16v-64c0-8.8-7.2-16-16-16zm-64 176H16c-8.8 0-16 7.2-16 16v64c0 8.8 7.2 16 16 16h416c8.8 0 16-7.2 16-16v-64c0-8.8-7.2-16-16-16z"/></svg>'
};
// ---------- UTILITY ----------------
function aos(){
  //Only Use the IntersectionObserver if it is supported
  if (IntersectionObserver) {
      //When the element is visible on the viewport, 
      //add the _a_completed class so it creates the _aos.
      let callback = function(entries) {
          entries.forEach(entry => {
              //if the element is visible, add the _a_completed class
              if (entry.isIntersecting && !entry.target.classList.contains('_a_completed')) {
                  entry.target.classList.add('_a_completed');
              }
              else{
                entry.target.classList.remove('_a_completed');
              }
          });
      }
      //Create the observer
      let observer = new IntersectionObserver(callback, {
          root: null,
          threshold: 0.2
      });

      //Get and observe all the items with the item class
      let items = document.querySelectorAll("[class*=_aos]");
      items.forEach((item) => {
          observer.observe(item);
      });
  }
}
aos();

/* --------------- Toast Message -------------- */

var notification = new Notif({
  topPos: "10px",
  classNames: 'success',
  autoClose: true,
  autoCloseTimeout: 2000
});

/* ------------------- Modal ------------------ */

const modal= document.getElementById("modal_1");
modal.onchange=()=>{
  if(modal.checked)
    document.body.style.overflow= "hidden";
  else
    document.body.style.overflow= "auto";
}
//Function to generate gradient color
function random_gradient() {
  var colorOne = {
    R: Math.floor(Math.random() * 255),
    G: Math.floor(Math.random() * 255),
    B: Math.floor(Math.random() * 255)
  };
  var colorTwo = {
    R: Math.floor(Math.random() * 255),
    G: Math.floor(Math.random() * 255),
    B: Math.floor(Math.random() * 255)
  };
  colorOne.rgb = 'rgb('  +  colorOne.R  +  ','  +  colorOne.G  +  ','  +  colorOne.B  +  ')';
  colorTwo.rgb = 'rgb('  +  colorTwo.R  +  ','  +  colorTwo.G  +  ','  +  colorTwo.B  +  ')';
  return 'radial-gradient(at top left, '  +  colorOne.rgb  +  ', '  +  colorTwo.rgb  +  ')';
}

//Function to select an option
function selectElement(id, valueToSelect) {    
    let element = document.getElementById(id);
    element.value = valueToSelect;
}
//Functions for localstorage store and get
function localStore(key, obj) {
  return window.localStorage.setItem(key, JSON.stringify(obj));
}
function localGet(key) {
  return JSON.parse(window.localStorage.getItem(key));
}
//Get elapsed minutes to date 
function diff_hours(dt) 
 {
  var now = new Date();
  var diff =(new Date(dt) - now.getTime()) / 1000;
  diff /= 60 ;
  return Math.abs(Math.round(diff));
 }
 function capitalizeF(str) {return str.charAt(0).toUpperCase()  +  str.slice(1);}
  function getJSON(url) {
    var resp = '';
    var xmlHttp = new XMLHttpRequest();
    if (xmlHttp != null) {
      xmlHttp.open("GET", url, false, {async: true});
      try {xmlHttp.send(null);} catch {console.error("xmlHttp send failed");}
      resp = xmlHttp.responseText;
    }
    return resp;
  }

// ---------- CONFIGURATION ----------
// div.innerHTML : {a.innerHTML : a.href}
/**/

//Get data from LocalStorage
var bk_data = localGet('bk_data');
var bk_time = localGet('bk_time');
var sb_data = localGet('sb_data');
var wth_data = localGet("wth_data");
var bdy_data = localGet("bdy_data");

if (bdy_data != undefined) {
  document.body.setAttribute("style", (bdy_data).replace('"', ''));
}else{
  document.body.style.setProperty("--bg-img",'radial-gradient(at top left, rgb(150,245,220), rgb(56,97,139))');
}
var grid_wrap= getComputedStyle(document.body).getPropertyValue("--grid-wrap");
var grid_width= getComputedStyle(document.body).getPropertyValue("--grid-width");
if(grid_wrap=="none"  && grid_width=="33.33%"){
  selectElement("grid_layout","h");
}else if(grid_wrap=="wrap" && grid_width=="33.33%"){
  selectElement("grid_layout","v3");
}else{
  selectElement("grid_layout","v2");
}
//Check data
if(sb_data == undefined){
  sb_data = {
    // Query variable name is q, hardcoded, looks like a standard already anyways
    "placeholder": "Search with commands..",
    "default": "d",
    "b": "https://bing.com/search?q=",
    "g": "https://google.com/search?q=",
    "d": "https://duckduckgo.com/?q=",
    "r": "https://www.reddit.com/search?q=",
    "y": "https://www.youtube.com/results?q="
  };
  localStore('sb_data',sb_data);
}
if (bk_data == undefined || bk_time == undefined) {
  bk_data = {};
  //Get bk_data into the array objects
  getBookmarks();
  console.log("bk_data undefined");
}else{
    if(diff_hours(bk_time) > 60 ){
      bk_data = {};
      console.log("Passed 60 minutes, sync");
      notification.showN('Passed 60 minutes, sync !', 'success');
      getBookmarks();
    }
}
if (wth_data == undefined) {
  wth_data = {status:false,api: "",lon: "",lat: ""}
}
/* ---------- Weather Settings Config --------- */

const wt_checkbox= document.getElementById("wt_status");
var wth_status = wth_data.status;
wt_checkbox.checked = wth_status;
document.body.style.setProperty("--wt", (wth_status)?"block":"none");
document.getElementById("wt_ik").value = wth_data.api;
document.getElementById("wt_ila").value = wth_data.lat;
document.getElementById("wt_iln").value = wth_data.lon;

wt_checkbox.onclick=()=>{
  var wth_status=wt_checkbox.checked;
document.body.style.setProperty("--wt", (wth_status)?"block":"none");
}

function f_save_wth() {

  const status = document.getElementById("wt_status").checked;
  const api = document.getElementById("wt_ik").value;
  const lat = document.getElementById("wt_ila").value;
  const lon = document.getElementById("wt_iln").value;
  wth_data.status = status;
  if (api && lat && lon) {
    wth_data.api = api;
    wth_data.lon = lon;
    wth_data.lat = lat;
  } 
  localStore("wth_data", wth_data);
    f_setup_wth();
}
function f_get_ll() {try {navigator.geolocation.getCurrentPosition(showPosition);}catch (e){alert(e);}}
function showPosition(position) {
  document.getElementById("wt_ila").value = position.coords.latitude;
  document.getElementById("wt_iln").value = position.coords.longitude;
}

  function f_setup_wth() {
    var appid = wth_data.api;
    if (appid.length > 6 && appid != "" && wth_status) {
      if ((typeof localStorage.cachedWeatherUpdate == "undefined") || ((Date.now() / 1000) - localStorage.cachedWeatherUpdate) > 600) {
        document.getElementById('wth_s').style.display = "none";
        var url = 'https://api.openweathermap.org/data/2.5/find?lat='  +  wth_data.lat  +  '&lon='  +  wth_data.lon  +  '&cnt=1&appid='  +  appid  +  '&callback=?';
        var data = getJSON(url);
        if (data == "") return;
        data = JSON.parse(data.substring(2, data.length - 1));
        document.getElementById("wth_l").style.opacity = 1;
        document.getElementById("wth_c").innerHTML = data.list[0].name;
        document.getElementById("wth_i").innerHTML = icons[data.list[0].weather[0].icon];
        document.getElementById("wth_d1").innerHTML = capitalizeF(data.list[0].weather[0].description);
        var temp = (data.list[0].main.temp - 273.15).toFixed(0);
        var temp_f = (data.list[0].main.feels_like - 273.15).toFixed(0);
        var temp_min = (data.list[0].main.temp_min - 273.15).toFixed(0);
        var temp_max = (data.list[0].main.temp_max - 273.15).toFixed(0);
        var tt = "&#8451;";
        var windDeg = data.list[0].wind.deg;
        //convert to F
        if (0) {
          temp = (1.8 * temp  +  32).toFixed(0);
          temp_f = (1.8 * temp_f  +  32).toFixed(0);
          temp_min = (1.8 * temp_min  +  32).toFixed(0);
          temp_max = (1.8 * temp_max  +  32).toFixed(0);
          tt = "&#8457;";
        }
        document.getElementById("wth_t").innerHTML = temp  +  tt;
        document.getElementById("wth_mm").innerHTML = temp_max  +  tt  +  " / "  +  temp_min  +  tt;
        document.getElementById('wth_w').innerHTML = ('<i class="far fa-wind _'  +  windDeg  +  '-deg" title="Wind direction ('  +  windDeg  +  ' degrees)"></i> '  +  data.list[0].wind.speed  +  " mps");
        document.getElementById('wth_h').innerHTML = (ntp_icons["humidity"] +  data.list[0].main.humidity  +  "%");
      }
      document.getElementById('wth_l').style.display = "none";
      document.getElementById('wth_top').style.opacity = 1;
      document.getElementById('wth_btm').style.opacity = 1;
    } else {
      document.getElementById('wth_l').style.display = "none";
      document.getElementById('wth_s').style.opacity = 1;
    }
  }
  f_setup_wth();


//Set up data
const sb_len = document.getElementById("sb_txt");
var sk = sb_data;
var sb_len_v = "";
for (var key in sk) {sb_len_v  += key  +  ' -> '  +  sk[key]  +  '\n';}
sb_len.value = sb_len_v;
function f_trim(s) {
  s = s.replace(/(^\s*)|(\s*$)/gi, "");
  s = s.replace(/[ ]{2,}/gi, " ");
  s = s.replace(/\n /, "\n");
  return s;
}
//Function save body style
function f_save_bdy() {
  localStore("bdy_data",document.body.getAttribute("style"));
  console.log("Settings saved !");
  notification.showN('Settings saved !', 'success');
}
  
/* ---- Function to save search bar config ---- */
function f_save_sb() { 
  var tlen = f_trim(document.getElementById("sb_txt").value) + "\n";
  var error = false;
  var lines = tlen.split('\n');
  lines.splice(-1, 1);
  lines= lines.filter(function(e){ return e.replace(/(\r\n|\n|\r)/gm,"")});
  var sKc = {};
  for (var i = 0; i < lines.length; i++ ) {
    var zlen = lines[i].split("->");
    if (zlen.length != 2) {
      i = lines.length;
      error = true;
    } else {
      sKc[f_trim(zlen[0])] = f_trim(zlen[1]);
    }
  }
  error = error || !(sKc['placeholder'] && sKc['default']);
  if (error) {
    alert("Looks like you removed important keywords like \n-placeholder\n-key\n-default\n Make sure to follow the syntax too :'k' -> 'value'");
  } else {
    sb_data = sKc;
    localStore('sb_data',sb_data);
  }
}
document.getElementById("mdl_save").onclick=()=>{f_save_sb();f_save_wth();f_save_bdy();};

// ---------- BUILD PAGE ----------
var pivotmatch = 0;
var totallinks = 0;
var prevregexp = "";
//Concatenate 2 json objects
function jsoncat(o1, o2) {
  for (var key in o2) o1[key] = o2[key];
  return o1;
}

//Get bk_data from browser 
function getBookmarks() {
  chrome.bookmarks.getTree(function (itemTree) {
    var fldh = itemTree.title;
    var urlh = {};
    itemTree.forEach((item) => {
      if (item.children)
        processFolder(item);
      else if (item.url) urlh[item.title] = [item.url, item.id];
    });
    if (Object.keys(urlh).length > 0)
      bk_data[fldh] = [urlh, itemTree.id];
    //Move the bar folder on top 
    var lastK = Object.keys(bk_data)[Object.keys(bk_data).length - 1];
    var lastEl = {};
    lastEl[lastK] = bk_data[lastK];
    bk_data = jsoncat(lastEl, bk_data);
    //Save on local storage 
    localStore('bk_data', bk_data);
    localStore('bk_time', new Date());
    matchLinks();
    console.log("getBookmarks - > Completed");
  });

}

//Recursive function for folders
function processFolder(item) {
  let fldk = item.title;
  let urls = {};
  item.children.forEach((child) => {
    if (child.children)
      processFolder(child);
    else
    if (child.url)
      urls[child.title] = [child.url, child.id];
  });
  if (Object.keys(urls).length > 0)
    bk_data[fldk] = [urls, item.id];
}


function matchLinks(regex = prevregexp) {
  totallinks = 0;
  pivotmatch = regex == prevregexp ? pivotmatch : 0;
  prevregexp = regex;
  var pivotbuffer = pivotmatch;
  var p = document.getElementById("links");
  while (p.firstChild) {
    p.removeChild(p.firstChild);
  }
  if (regex.charAt(1) == " " && sb_data.hasOwnProperty(regex.charAt(0))) {
    document.getElementById("action").action = sb_data[regex.charAt(0)];
    document.getElementById("action").children[0].name = "q";
  } else {
    var match = new RegExp(regex ? regex : ".", "i");
    var gmatches = false;
    var fldKeys = Object.keys(bk_data);
    for (var i = 0; i < fldKeys.length; i++) {
      var matches = 0,
        selected, slink = false;
      var fldName = fldKeys[i];
      var section = document.createElement("div");
      section.id = bk_data[fldName][1];
      section.innerHTML = "<div id='title'> " + fldName + "</div>";
      section.className = "section";
      var inner = document.createElement("div");
      var urlKeys = Object.keys(bk_data[fldName][0]);
      for (var l = 0; l < urlKeys.length; l++) {
        var ln = urlKeys[l];
        if (match.test(ln)) {
          var link = document.createElement("a");
          link.id = bk_data[fldName][0][ln][1];
          link.href = bk_data[fldName][0][ln][0];
          link.innerHTML = ln;
          if (!pivotbuffer++ && regex != "") {
            selected = true;
            link.className = "selected";
            document.getElementById("action").action = link.href;
            document.getElementById("action").children[0].removeAttribute("name");
            slink = link.getAttribute("id");
          }
          inner.appendChild(link);
          matches += 1;
          gmatches = true;
          totallinks++;
        }
      }
      section.appendChild(inner);
      if (matches > 0) p.appendChild(section);
      if (slink != "") document.getElementById(slink).scrollIntoView({
        block: 'center'
      });
      //if(selected) section.scrollIntoView({behavior:'smooth'});
    }
    if (!gmatches || regex == "") {
      document.getElementById("action").action = sb_data[sb_data["default"]];
      document.getElementById("action").children[0].name = "q";
    }
  }
  //document.getElementById("main").style.height = document.getElementById("main").children[0].offsetHeight + "px";
}

document.getElementById("sb_input").onkeydown = function (e) {
  switch (e.keyCode) {
    case 38:
      pivotmatch = pivotmatch >= 0 ? 0 : pivotmatch + 1;
      matchLinks();
      break;
    case 40:
      pivotmatch =
        pivotmatch <= -totallinks + 1 ? -totallinks + 1 : pivotmatch - 1;
      matchLinks();
      break;
    default:
      break;
  }
  document.getElementById("action").children[0].focus();
};

document.getElementById("action").children[0].onkeypress = function (e) {
  if (e.key == "ArrowDown" || e.key == "ArrowUp") {
    return false;
  }
};

document.getElementById("get_ll").onclick=()=>{
  f_get_ll();
}

document.getElementById("sync-bk").onclick= ()=>{
  console.log("Sync bk_data...");
  bk_data = {};
  getBookmarks();
  console.log("Sync from your bookmarks done!");
  notification.showN('Sync from your bookmarks done !', 'success');
}
document.getElementById("reset-ntp").onclick=()=>{
  var r = confirm("You will not lose your bookmarks , only the settings !\nAre you sure you want to reset the ntp settings? ");
  if (r == true) {
    window.localStorage.clear();
    console.log("Reset of settings done !");
    notification.showN("Reset of settings done !", 'success');
    setTimeout(()=>{
      location.reload();
    },1000);
  }
}
function displayClock() {
  var now = new Date();
  var clock =
    (now.getHours() < 10 ? "0" + now.getHours() : now.getHours()) +
    ":" +
    (now.getMinutes() < 10 ? "0" + now.getMinutes() : now.getMinutes()) +
    ":" +
    (now.getSeconds() < 10 ? "0" + now.getSeconds() : now.getSeconds());
  document.getElementById("clock").innerHTML = clock;
}

//window.onload = matchLinks();
var sb_input = document.getElementById("sb_input");
sb_input.addEventListener("input", () => {
  matchLinks(sb_input.value);
});
document.body.onresize = matchLinks();
document.getElementById("action").onsubmit = function () {
  var svalue = this.children[0].value;
  if (svalue.charAt(1) == " " && sb_data.hasOwnProperty(svalue.charAt(0))) {
    this.children[0].value = svalue.substring(2);
  }
  return true;
};
displayClock();
setInterval(displayClock, 1000);


  /* ----------- Config NTP Background ---------- */
  const wDevice = (window.innerWidth) ? window.innerWidth : screen.width;
  const hDevice = (window.innerHeight) ? (window.innerHeight  +  56) : screen.height;
  const bg_pld = document.getElementById('bg_pld'),
    crop = document.getElementById('crop'),
    result = document.getElementById('result'),
    imgRes = document.getElementById('imgRes'),
    crpp = document.getElementById('croppie');
  var cr, cr_img = '',img_w = wDevice / 2,img_h = hDevice / 2,isCrop = 0;
  while (img_w > 300) {img_w = img_w / 1.2;img_h = img_h / 1.2;}
  document.body.style.setProperty("--bg-cw", img_w  +  "px");
  document.body.style.setProperty("--bg-ch", img_h  +  "px");
  function savebg_cropped() {
    document.body.style.setProperty("--bg-img", "url("  +  imgRes.src  +  ")");
    document.body.style.setProperty("--bg-cl", "#fff");
    cropCancel();
    //f_save_bdy();
  }
  const wllp_file = document.getElementById("wllp_file");
  const grid_layout= document.getElementById("grid_layout");
  wllp_file.onchange=()=>{ f_wallp1();};
  document.getElementById("wllp_url").onclick=()=>{f_wallp2();};
  document.getElementById("wllp_gradient").onclick=()=>{f_wallp3();};
  document.getElementById("crop_cancel").onclick=()=>{cropCancel();};
  document.getElementById("crop_cancel2").onclick=()=>{cropCancel();};
  document.getElementById("crop_next").onclick=()=>{cropResult();};
  document.getElementById("crop_save").onclick=()=>{savebg_cropped();};
  grid_layout.onchange=()=>{
    var lv=grid_layout.value;
    if(lv=="h"){
      document.body.style.setProperty("--grid-wrap", 'none');
      document.body.style.setProperty("--grid-width", '33.33%');
    }else if(lv=='v2'){
      document.body.style.setProperty("--grid-wrap", 'wrap');
      document.body.style.setProperty("--grid-width", '50%');
    }else{
      document.body.style.setProperty("--grid-wrap", 'wrap');
      document.body.style.setProperty("--grid-width", '33.33%');
    }
  }

  /* ------------ Config Color Picker ----------- */
  const cp_stt =document.querySelectorAll(".stt_clfrt");
  const cp_lrt = document.getElementById("cl_vn");
  var cp_current_el;
  var picker = new Picker({
    parent: document.querySelector('#cp_v'),
    popup: false,
    cancelButton: true,
    onDone: function (color) {
      if (cp_current_el != null ) 
        document.body.style.setProperty("--c"  +  cp_current_el, color.hex);
      cp_lrt.classList.toggle("show-lrt");
    }
  });

  cp_stt.forEach(element => {
    element.onclick=()=>{f_cp_rgb((element.id).replace(/\D/g, ""))};
  });
 document.getElementById("close_clvn").onclick=()=>{f_close_cl()};
  function f_cp_rgb(t) {
    cp_current_el = t;
    let color = getComputedStyle(document.body).getPropertyValue("--c"  +  t);
    picker.setColor(color, true);
    cp_lrt.classList.toggle("show-lrt");
  }
  function f_close_cl() {
    cp_lrt.classList.toggle("show-lrt");
  }
  document.getElementById('backup_btn').onclick = function () {
    var dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(localStorage));
    var date = new Date();
    var exportFileDefaultName = 'b2ntp_Backup' + date.getUTCFullYear() + '' + (date.getUTCMonth() + 1) + '' + date.getUTCDate() + '_' +
        date.getHours() + '_' + date.getMinutes() + '.json';
      var linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  
/* ------------ CONTEXT MENU CONFIG ----------- */

/*
  const menu = document.querySelector(".context");
  const menuOption = document.querySelector(".context_item");
  let menuVisible = false;
  
  const toggleMenu = command => {
    menu.style.display = command === "show" ? "block" : "none";
    menuVisible = !menuVisible;
  };
  
  const setPosition = ({ top, left }) => {
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
    toggleMenu("show");
  };
  
   
  window.addEventListener("click", e => {
    if (menuVisible) toggleMenu("hide");
  });
  
  menuOption.addEventListener("click", e => {
    console.log("mouse-option", e.target.innerHTML);
  });
  
  window.addEventListener("contextmenu", e => {
    e.preventDefault();
    const origin = {
      left: e.pageX,
      top: e.pageY
    };
    setPosition(origin);
    return false;
  });
*/


  function f_wallp1() {
    var file = wllp_file.files[0];
    if (file && file.type.match('image.*')) {
      var reader = new FileReader();
      reader.onload = function (e) {
        bg_pld.style.display = "none";
        if (cr_img == '') {
          cr_img = e.target.result;
          cropInit();
        } else {
          cr_img = e.target.result;
          bindCropImg();
        }
        crop.style.display = "inline";
      }
      reader.readAsDataURL(file);
    }
  }
  function f_wallp2() {
    var url = prompt("Enter url of the wallpaper . \nExample : ", "url");
    var image = new Image();
    image.crossOrigin = "Anonymous";
    image.onload = function (e) {
      bg_pld.style.display = "none";
      if (cr_img == '') {
        cr_img = image.src;
        cropInit();
      } else {
        cr_img = image.src;
        bindCropImg();
      }
      crop.style.display = "inline";
    };
    image.src = (url);
  }
  function f_wallp3() {
    document.body.style.setProperty("--bg-img",random_gradient());
    
  }

/* -------------- Config Croppie -------------- */
  function cropInit(){
    cr = new Croppie(crpp, {
      viewport: {width: img_w,height: img_h},
      boundary: {width: img_w,height: img_h},
      mouseWheelZoom: false,
      enableOrientation: true
    });
    bindCropImg();
  }
  function bindCropImg(){cr.bind({url: cr_img})
  }
  function cropCancel(){
    if (bg_pld.style.display == "none") {
      bg_pld.style.display = "inline";
      crop.style.display = "none";
      result.style.display = "none";
      wllp_file.value = "";
      isCrop = 0;
    }
  }
  function cropResult() {
    if (!isCrop) {
      isCrop = 1;
      cr.result({
        type: 'base64', // canvas(base64)|html
        size: '{width:wDevice, height:hDevice}',
        format: 'jpeg', //'jpeg'|'png'|'webp'
        quality: 1 //0~1
      }).then(function (resp) {
        crop.style.display = "none";
        imgRes.src = resp;
        result.style.display = "inline";
      });
    }
  }