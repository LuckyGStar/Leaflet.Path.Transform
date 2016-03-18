"use strict";if(L.Browser.svg){L.Path.include({_resetTransform:function(){this._container.setAttributeNS(null,"transform","")},_applyTransform:function(t){this._container.setAttributeNS(null,"transform","matrix("+t.join(" ")+")")}})}else{L.Path.include({_resetTransform:function(){if(this._skew){this._skew.on=false;this._container.removeChild(this._skew);this._skew=null}},_applyTransform:function(t){var i=this._skew;if(!i){i=this._createElement("skew");this._container.appendChild(i);i.style.behavior="url(#default#VML)";this._skew=i}var n=t[0].toFixed(8)+" "+t[1].toFixed(8)+" "+t[2].toFixed(8)+" "+t[3].toFixed(8)+" 0 0";var a=Math.floor(t[4]).toFixed()+", "+Math.floor(t[5]).toFixed()+"";var r=this._container.style;var o=parseFloat(r.left);var s=parseFloat(r.top);var e=parseFloat(r.width);var h=parseFloat(r.height);if(isNaN(o))o=0;if(isNaN(s))s=0;if(isNaN(e)||!e)e=1;if(isNaN(h)||!h)h=1;var _=(-o/e-.5).toFixed(8)+" "+(-s/h-.5).toFixed(8);i.on="f";i.matrix=n;i.origin=_;i.offset=a;i.on=true}})}L.Path.include({_onMouseClick:function(t){if(this.dragging&&this.dragging.moved()||this._map.dragging&&this._map.dragging.moved()){return}this._fireMouseEvent(t)}});"use strict";L.Handler.PathDrag=L.Handler.extend({statics:{DRAGGABLE_CLS:"leaflet-path-draggable"},initialize:function(t){this._path=t;this._matrix=null;this._startPoint=null;this._dragStartPoint=null;this._dragInProgress=false},addHooks:function(){var t=L.Handler.PathDrag.DRAGGABLE_CLS;var i=this._path._path;this._path.on("mousedown",this._onDragStart,this);this._path.options.className=(this._path.options.className||"")+" "+t;if(!L.Path.CANVAS&&i){L.DomUtil.addClass(i,t)}},removeHooks:function(){var t=L.Handler.PathDrag.DRAGGABLE_CLS;var i=this._path._path;this._path.off("mousedown",this._onDragStart,this);this._path.options.className=(this._path.options.className||"").replace(t,"");if(!L.Path.CANVAS&&i){L.DomUtil.removeClass(i,t)}},moved:function(){return this._path._dragMoved},inProgress:function(){return this._dragInProgress},_onDragStart:function(t){this._dragInProgress=true;this._startPoint=t.containerPoint.clone();this._dragStartPoint=t.containerPoint.clone();this._matrix=[1,0,0,1,0,0];if(this._path._point){this._point=this._path._point.clone()}this._path._map.on("mousemove",this._onDrag,this).on("mouseup",this._onDragEnd,this);this._path._dragMoved=false},_onDrag:function(t){var i=t.containerPoint.x;var n=t.containerPoint.y;var a=this._matrix;var r=this._path;var o=this._startPoint;var s=i-o.x;var e=n-o.y;if(!r._dragMoved&&(s||e)){r._dragMoved=true;r.fire("dragstart");if(r._popup){r._popup._close();r.off("click",r._openPopup,r)}}a[4]+=s;a[5]+=e;o.x=i;o.y=n;r._applyTransform(a);if(r._point){r._point.x=this._point.x+a[4];r._point.y=this._point.y+a[5]}r.fire("drag");L.DomEvent.stop(t.originalEvent)},_onDragEnd:function(t){L.DomEvent.stop(t);this._dragInProgress=false;this._path._resetTransform();this._transformPoints(this._matrix);this._path._map.off("mousemove",this._onDrag,this).off("mouseup",this._onDragEnd,this);this._path.fire("dragend",{distance:Math.sqrt(L.LineUtil._sqDist(this._dragStartPoint,t.containerPoint))});if(this._path._popup){L.Util.requestAnimFrame(function(){this._path.on("click",this._path._openPopup,this._path)},this)}this._matrix=null;this._startPoint=null;this._point=null;this._dragStartPoint=null;this._path._dragMoved=false},_transformPoint:function(t,i){var n=this._path;var a=L.point(i[4],i[5]);var r=n._map.options.crs;var o=r.transformation;var s=r.scale(n._map.getZoom());var e=r.projection;var h=o.untransform(a,s).subtract(o.untransform(L.point(0,0),s));return e.unproject(e.project(t)._add(h))},_transformPoints:function(t){var i=this._path;var n,a,r;var o=L.point(t[4],t[5]);var s=i._map.options.crs;var e=s.transformation;var h=s.scale(i._map.getZoom());var _=s.projection;var l=e.untransform(o,h).subtract(e.untransform(L.point(0,0),h));if(i._point){i._latlng=_.unproject(_.project(i._latlng)._add(l));i._point=this._point._add(o)}else if(i._originalPoints){for(n=0,a=i._originalPoints.length;n<a;n++){r=i._latlngs[n];i._latlngs[n]=_.unproject(_.project(r)._add(l));i._originalPoints[n]._add(o)}}if(i._holes){for(n=0,a=i._holes.length;n<a;n++){for(var g=0,d=i._holes[n].length;g<d;g++){r=i._holes[n][g];i._holes[n][g]=_.unproject(_.project(r)._add(l));i._holePoints[n][g]._add(o)}}}i._updatePath()}});L.Path.addInitHook(function(){if(this.options.draggable){if(this.dragging){this.dragging.enable()}else{this.dragging=new L.Handler.PathDrag(this);this.dragging.enable()}}else if(this.dragging){this.dragging.disable()}});L.Circle.prototype._getLatLng=L.Circle.prototype.getLatLng;L.Circle.prototype.getLatLng=function(){if(this.dragging&&this.dragging.inProgress()){return this.dragging._transformPoint(this._latlng,this.dragging._matrix)}else{return this._getLatLng()}};L.Polyline.prototype._getLatLngs=L.Polyline.prototype.getLatLngs;L.Polyline.prototype.getLatLngs=function(){if(this.dragging&&this.dragging.inProgress()){var t=this.dragging._matrix;var i=this._getLatLngs();for(var n=0,a=i.length;n<a;n++){i[n]=this.dragging._transformPoint(i[n],t)}return i}else{return this._getLatLngs()}};(function(){L.FeatureGroup.EVENTS+=" dragstart";function t(t,i,n){for(var a=0,r=t.length;a<r;a++){var o=t[a];o.prototype["_"+i]=o.prototype[i];o.prototype[i]=n}}function i(t){if(this.hasLayer(t)){return this}t.on("drag",this._onDrag,this).on("dragend",this._onDragEnd,this);return this._addLayer.call(this,t)}function n(t){if(!this.hasLayer(t)){return this}t.off("drag",this._onDrag,this).off("dragend",this._onDragEnd,this);return this._removeLayer.call(this,t)}t([L.MultiPolygon,L.MultiPolyline],"addLayer",i);t([L.MultiPolygon,L.MultiPolyline],"removeLayer",n);var a={_onDrag:function(t){var i=t.target;this.eachLayer(function(t){if(t!==i){t._applyTransform(i.dragging._matrix)}});this._propagateEvent(t)},_onDragEnd:function(t){var i=t.target;this.eachLayer(function(t){if(t!==i){t._resetTransform();t.dragging._transformPoints(i.dragging._matrix)}});this._propagateEvent(t)}};L.MultiPolygon.include(a);L.MultiPolyline.include(a)})();L.LineUtil.pointOnLine=function(t,i,n){var a=1+n/t.distanceTo(i);return new L.Point(t.x+(i.x-t.x)*a,t.y+(i.y-t.y)*a)};L.Util.merge=function(){var t=1;var i,n;var a=arguments[t];function r(t){return Object.prototype.toString.call(t)==="[object Object]"}var o=arguments[0];while(a){a=arguments[t++];for(i in a){if(!a.hasOwnProperty(i)){continue}n=a[i];if(r(n)&&r(o[i])){o[i]=L.Util.merge(o[i],n)}else{o[i]=n}}}return o};L.Matrix=function(t,i,n,a,r,o){this._matrix=[t,i,n,a,r,o]};L.Matrix.prototype={transform:function(t){return this._transform(t.clone())},_transform:function(t){var i=this._matrix;var n=t.x,a=t.y;t.x=i[0]*n+i[1]*a+i[4];t.y=i[2]*n+i[3]*a+i[5];return t},untransform:function(t){var i=this._matrix;return new L.Point((t.x/i[0]-i[4])/i[0],(t.y/i[2]-i[5])/i[2])},clone:function(){var t=this._matrix;return new L.Matrix(t[0],t[1],t[2],t[3],t[4],t[5])},translate:function(t){if(t===undefined){return new L.Point(this._matrix[4],this._matrix[5])}var i,n;if(typeof t==="number"){i=n=t}else{i=t.x;n=t.y}return this._add(1,0,0,1,i,n)},scale:function(t,i){if(t===undefined){return new L.Point(this._matrix[0],this._matrix[3])}var n,a;i=i||L.point(0,0);if(typeof t==="number"){n=a=t}else{n=t.x;a=t.y}return this._add(n,0,0,a,i.x,i.y)._add(1,0,0,1,-i.x,-i.y)},rotate:function(t,i){var n=Math.cos(t);var a=Math.sin(t);i=i||new L.Point(0,0);return this._add(n,a,-a,n,i.x,i.y)._add(1,0,0,1,-i.x,-i.y)},flip:function(){this._matrix[1]*=-1;this._matrix[2]*=-1;return this},_add:function(t,i,n,a,r,o){var s=[[],[],[]];var e=this._matrix;var h=[[e[0],e[2],e[4]],[e[1],e[3],e[5]],[0,0,1]];var _=[[t,n,r],[i,a,o],[0,0,1]],l;if(t&&t instanceof L.Matrix){e=t._matrix;_=[[e[0],e[2],e[4]],[e[1],e[3],e[5]],[0,0,1]]}for(var g=0;g<3;g++){for(var d=0;d<3;d++){l=0;for(var p=0;p<3;p++){l+=h[g][p]*_[p][d]}s[g][d]=l}}this._matrix=[s[0][0],s[1][0],s[0][1],s[1][1],s[0][2],s[1][2]];return this}};L.matrix=function(t,i,n,a,r,o){return new L.Matrix(t,i,n,a,r,o)};L.Handler.PathTransform=L.Handler.extend({options:{rotation:true,scaling:true,handlerOptions:{radius:5,fillColor:"#ffffff",color:"#202020",fillOpacity:1},boundsOptions:{weight:1,opacity:1,dashArray:[3,3],fill:false},rotateHandleOptions:{weight:1,opacity:1},handleLength:20,edgesCount:4},initialize:function(t){this._path=t;this._map=null;this._activeMarker=null;this._originMarker=null;this._rotationMarker=null;this._rotationOrigin=null;this._scaleOrigin=null;this._angle=0;this._scale=L.point(1,1);this._initialDist=0;this._rotationStart=null;this._rotationOriginPt=null;this._matrix=new L.Matrix(1,0,0,1,0,0);this._projectedMatrix=new L.Matrix(1,0,0,1,0,0);this._handlersGroup=null;this._rect=null;this._handlers=[];this._handleLine=null},enable:function(t){if(this._path._map){this._map=this._path._map;if(t){this.setOptions(t)}L.Handler.prototype.enable.call(this)}},addHooks:function(){this._createHandlers();this._path.on("dragstart",this._onDragStart,this).on("dragend",this._onDragEnd,this)},removeHooks:function(){this._hideHandlers();this._handlersGroup=null;this._rect=null;this._handlers=[]},setOptions:function(t){var i=this._enabled;if(i){this.disable()}this.options=L.Util.merge({},JSON.parse(JSON.stringify(L.Handler.PathTransform.prototype.options)),t);if(i){this.enable()}return this},_update:function(){var t=this._matrix;for(var i=0,n=this._handlers.length;i<n;i++){var a=this._handlers[i];if(a!==this._originMarker){a._point=t.transform(a._initialPoint);a._updatePath()}}t=t.clone().flip();this._applyTransform(t)},_applyTransform:function(t){this._path._applyTransform(t._matrix);this._rect._applyTransform(t._matrix);if(this.options.rotation){this._handleLine._applyTransform(t._matrix)}},_apply:function(){var t=this._map;this._transformGeometries();for(var i=0,n=this._handlers.length;i<n;i++){var a=this._handlers[i];a._latlng=t.layerPointToLatLng(a._point);delete a._initialPoint;a.redraw()}this._matrix=L.matrix(1,0,0,1,0,0);this._scale=L.point(1,1);this._angle=0;this._updateHandlers();t.dragging.enable()},_updateHandlers:function(){var t=this._handlersGroup;this._rectShape=this._rect.toGeoJSON();t.removeLayer(this._handleLine);t.removeLayer(this._rotationMarker);this._handleLine=this._rotationMarker=null;for(var i=this._handlers.length-1;i>=0;i--){t.removeLayer(this._handlers[i])}this._createHandlers()},_transformGeometries:function(){var t=this._origin;this._path._resetTransform();this._rect._resetTransform();this._transformPoints(this._path,this._matrix,t);this._transformPoints(this._rect,this._matrix,t);if(this.options.rotation){this._handleLine._resetTransform();this._transformPoints(this._handleLine,this._matrix,t)}},_getProjectedMatrix:function(t,i){var n=this._map;var a=n.getMaxZoom();var t=L.matrix(1,0,0,1,0,0);var r;if(this._angle){r=n.project(this._rotationOrigin,a);t=t.rotate(this._angle,r).flip()}if(!(this._scale.x===1&&this._scale.y===1)){r=n.project(this._scaleOrigin,a);t=t._add(L.matrix(1,0,0,1,r.x,r.y))._add(L.matrix(this._scale.x,0,0,this._scale.y,0,0))._add(L.matrix(1,0,0,1,-r.x,-r.y))}return t},_transformPoint:function(t,i,n,a){return n.unproject(i.transform(n.project(t,a)),a)},_transformPoints:function(t,i,n){var a=t._map;var r=a.getMaxZoom();var o,s;var e=this._projectedMatrix=this._getProjectedMatrix();if(t._point){t._latlng=this._transformPoint(t._latlng,e,a,r)}else if(t._originalPoints){for(o=0,s=t._originalPoints.length;o<s;o++){t._latlngs[o]=this._transformPoint(t._latlngs[o],e,a,r)}}if(t._holes){for(o=0,s=t._holes.length;o<s;o++){for(var h=0,_=t._holes[o].length;h<_;h++){t._holes[o][h]=this._transformPoint(t._holes[o][h],e,a,r)}}}t.projectLatlngs();t._updatePath()},_createHandlers:function(){var t=this._map;this._handlersGroup=this._handlersGroup||(new L.LayerGroup).addTo(t);this._rect=this._rect||this._getBoundingPolygon().addTo(this._handlersGroup);if(this.options.scaling){this._handlers=[];for(var i=0;i<this.options.edgesCount;i++){this._handlers.push(this._createHandler(this._rect._latlngs[i],i*2,i).addTo(this._handlersGroup))}}if(this.options.rotation){this._createRotationHandlers()}},_createRotationHandlers:function(){var t=this._map;var i=this._rect._latlngs;var n=new L.LatLng((i[0].lat+i[3].lat)/2,(i[0].lng+i[3].lng)/2);var a=new L.LatLng((i[1].lat+i[2].lat)/2,(i[1].lng+i[2].lng)/2);var r=t.layerPointToLatLng(L.LineUtil.pointOnLine(t.latLngToLayerPoint(n),t.latLngToLayerPoint(a),this.options.handleLength));this._handleLine=new L.Polyline([a,r],this.options.rotateHandleOptions).addTo(this._handlersGroup);this._rotationMarker=new L.CircleMarker(r,this.options.handlerOptions).addTo(this._handlersGroup).on("mousedown",this._onRotateStart,this);this._rotationOrigin=new L.LatLng((a.lat+n.lat)/2,(a.lng+n.lng)/2);this._handlers.push(this._rotationMarker)},_getRotationOrigin:function(){var t=this._rect._latlngs;var i=t[0];var n=t[2];return new L.LatLng((i.lat+n.lat)/2,(i.lng+n.lng)/2)},_onRotateStart:function(t){var i=this._map;i.dragging.disable();this._originMarker=null;this._rotationOriginPt=i.latLngToLayerPoint(this._getRotationOrigin());this._rotationStart=t.layerPoint;this._initialMatrix=this._matrix.clone();this._angle=0;this._path._map.on("mousemove",this._onRotate,this).on("mouseup",this._onRotateEnd,this);this._cachePoints()},_onRotate:function(t){var i=t.layerPoint;var n=this._rotationStart;var a=this._rotationOriginPt;this._angle=Math.atan2(i.y-a.y,i.x-a.x)-Math.atan2(n.y-a.y,n.x-a.x);this._matrix=this._initialMatrix.clone().rotate(this._angle,a).flip();this._update()},_onRotateEnd:function(t){this._path._map.off("mousemove",this._onRotate,this).off("mouseup",this._onRotateEnd,this);this._apply()},_onScaleStart:function(t){var i=t.target;var n=this._map;n.dragging.disable();this._activeMarker=i;this._originMarker=this._handlers[(i.options.index+2)%4];this._scaleOrigin=this._originMarker.getLatLng();this._initialMatrix=this._matrix.clone();this._cachePoints();this._map.on("mousemove",this._onScale,this).on("mouseup",this._onScaleEnd,this);this._initialDist=this._originMarker._point.distanceTo(this._activeMarker._point)},_onScale:function(t){var i=this._originMarker._point;var n=i.distanceTo(t.layerPoint)/this._initialDist;this._scale=new L.Point(n,n);this._matrix=this._initialMatrix.clone().scale(n,i);this._update()},_onScaleEnd:function(t){this._map.off("mousemove",this._onScale,this).off("mouseup",this._onScaleEnd,this);this._apply()},_cachePoints:function(){this._handlersGroup.eachLayer(function(t){t.bringToFront()});for(var t=0,i=this._handlers.length;t<i;t++){var n=this._handlers[t];n._initialPoint=n._point.clone()}},_getBoundingPolygon:function(){if(this._rectShape){return L.GeoJSON.geometryToLayer(this._rectShape,null,null,this.options.boundsOptions)}else{return new L.Rectangle(this._path.getBounds(),this.options.boundsOptions)}},_createHandler:function(t,i,n){var a=new L.CircleMarker(t,L.Util.extend(this.options.handlerOptions,{type:i,index:n}));a.on("mousedown",this._onScaleStart,this);return a},_hideHandlers:function(){this._map.removeLayer(this._handlersGroup)},_onDragStart:function(){this._hideHandlers()},_onDragEnd:function(t){var i=this._rect;var n=(t.layer?t.layer:this._path).dragging._matrix;if(!i.dragging){i.dragging=new L.Handler.PathDrag(i)}i.dragging.enable();this._map.addLayer(i);i.dragging._transformPoints(n);i.dragging.disable();this._map.addLayer(this._handlersGroup);this._updateHandlers()}});L.Path.addInitHook(function(){if(this.options.transform){this.transform=new L.Handler.PathTransform(this,this.options.transform)}});L.Handler.MultiPathTransform=L.Handler.PathTransform.extend({_applyTransform:function(t){this._path.eachLayer(function(i){i._applyTransform(t._matrix)});this._rect._applyTransform(t._matrix);if(this.options.rotation){this._handleLine._applyTransform(t._matrix)}},_transformGeometries:function(){var t=this._origin;this._rect._resetTransform();this._path.eachLayer(function(i){i._resetTransform();this._transformPoints(i,this._matrix,t)},this);this._transformPoints(this._rect,this._matrix,t);if(this.options.rotation){this._handleLine._resetTransform();this._transformPoints(this._handleLine,this._matrix,t)}}});(function(t){function i(){if(this._options.transform){this.transform=new L.Handler.MultiPathTransform(this,this._options.transform)}}for(var n=t.length-1;n>=0;n--){t[n].addInitHook(i)}})([L.MultiPolyline,L.MultiPolygon]);