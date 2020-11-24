import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Map, TileLayer, Marker, Icon, CircleMarker, GeoJSON, Canvas, LayerGroup, Polyline, Polygon} from 'leaflet';
import {HttpClient} from '@angular/common/http';
import {FeatureService} from '../../../shared/services/feature.service';
import {ConfigService} from '../../../shared/services/config.service';



@Component({
    selector: 'app-geojson',
    templateUrl: './geojson.component.html',
    styleUrls: ['./geojson.component.css']
})
export class GeojsonComponent implements OnInit {

    features = [];
    map : any;

    @ViewChild('map', { static: true }) mapDiv: ElementRef;

    constructor(private http: HttpClient, private featureService: FeatureService, private configService: ConfigService) {
        L.Label = L.Canvas
            .extend({
                options : {
                    collision: true,   //叠盖冲突选项
                    mode: 0              //0 default 1 create 2 select(identify)
                },

                initialize : function(options) {
                    options = L.Util.setOptions(this, options);
                    //add
                    L.Util.stamp(this);
                    this._layers = {};
                    this._labels = [];
                    this._preAdds = [];   //在Label Canvas还没有添加到map时，对addLabel的label进行记录，以便在onAdd时进行添加。
                },
                //Label Canvas添加到map时响应
                onAdd: function () {
                    L.Canvas.prototype.onAdd.call(this);
                    // Redraw vectors since canvas is cleared upon removal,
                    // in case of removing the renderer itself from the map.
                    //this._draw();
                    if (!this._map) return;
                    this._preAdds.forEach( item => {
                        item.addTo(this._map);
                        this._text(item);
                        this._labels.push(item.label);
                    });
                    this._preAdds = [];
                },
                //外部添加label
                addLabel: function(label) {
                    const circle = new L.CircleMarker([label.position.lat, label.position.lng], {radius: 1, stroke: false, renderer: this});
                    circle.label = label;
                    if (this._map) {
                        circle.addTo(this._map);
                        this._text(circle);
                        this._labels.push(circle.label);
                    } else {
                        this._preAdds.push(circle);
                    }
                },
                //外部清除某个label
                removeLabel: function(label) {
                    const item = Object.keys(this._layers).find( key => {
                        const circle = this._layers[key];
                        return circle && circle.label && circle.label._id == label._id;
                    });
                    item && this._layers[item].removeFrom(this._map);
                    this._redraw();
                },
                //外部清除所有label
                clearLabel: function() {
                    Object.keys(this._layers).forEach( key => {
                        const circle = this._layers[key];
                        circle.removeFrom(this._map);
                    });
                    this._layers = {};
                    this._labels = [];
                    this._preAdds = [];
                    this._redraw();
                },
                //外部redraw某个label
                redrawLabel: function(label) {
                    const item = Object.keys(this._layers).find( key => {
                        const layer = this._layers[key];
                        return layer && layer.label && layer.label._id == label._id;
                    });
                    item && this._updateCircle(this._layers[item]);
                },
                //外部redraw
                redraw: function() {
                    this._redraw();
                },

                //this._update => fire('update') => canvas._updatePaths => canvas._redraw => canvas._draw => layer(circlemarker)._updatePath => this._updateCircle => (Label)this._text
                //this._update => fire('update') => canvas._updatePaths => layer._update                  => layer(circlemarker)._updatePath => this._updateCircle => (Label)this._text
                //更新函数，调用逻辑流程顺序见上方
                _update : function() {
                    //this._time = new Date();
                    //console.log(this._time.toString() + " update");
                    // drawn
                    this._drawn = [];
                    L.Canvas.prototype._update.call(this);
                },
                //重载，非常重要，否则layer._updatePath会调用两次
                _updatePaths: function () {
                    if (this._postponeUpdatePaths) { return; }

                    this._redrawBounds = null;
                    this._redraw();
                },
                //无需重载，调试用
                _redraw: function () {
                    //console.log(this._time.toString() + " redraw");
                    L.Canvas.prototype._redraw.call(this);
                    console.log("all " + this._labels.length + " _drawn " + this._drawn.length );
                },
                //无需重载，调试用
                _draw: function () {
                    //console.log(this._time.toString() + " draw");
                    L.Canvas.prototype._draw.call(this);
                },
                //Polyline和Polygon的更新
                _updatePoly : function(layer, closed) {
                    L.Canvas.prototype._updatePoly.call(this, layer, closed);
                    this._text(layer);
                },
                //CircleMarker的更新
                _updateCircle : function(layer) {
                    L.Canvas.prototype._updateCircle.call(this, layer);
                    this._text(layer);
                },
                //标注
                _text : function(layer) {
                    if (layer.label && layer.label.text != undefined) {
                        layer.label.drawn = false;
                        if (!this._bounds || (layer._pxBounds && layer._pxBounds.intersects(this._bounds))) {
                            const zoom = this._map.getZoom();
                            const min = ((layer.label.zoom || {}).min || 1);
                            const max = ((layer.label.zoom || {}).max || 18);
                            if (zoom >= min && zoom <= max) {
                                this._ctx.save();
                                this._ctx.globalAlpha = 1;
                                this._ctx.font = ((layer.label.font || {}).size || 12) + 'px ' + ((layer.label.font || {}).family || 'YaHei') +  ' ' + ((layer.label.font || {}).bold || 'Bold');
                                layer.label.point = layer._point;
                                layer.label.width = this._ctx.measureText(layer.label.text).width + ((layer.label.background || {}).padding || 5) * 2;
                                layer.label.height = ((layer.label.font || {}).size || 12)  + ((layer.label.background || {}).padding || 5) * 2;
                                if (this.options.collision) {
                                    const bounds = L.bounds(L.point(layer.label.point.x, layer.label.point.y), L.point(layer.label.width + layer.label.point.x, layer.label.height + layer.label.point.y));
                                    //const object = this._labels.filter(label => label.drawn).map( label => L.bounds(L.point(label.point.x, label.point.y), L.point(label.width + label.point.x, label.height + label.point.y)))
                                    const object = this._drawn.map( (label:any) => L.bounds(L.point(label.point.x, label.point.y), L.point(label.width + label.point.x, label.height + label.point.y)))
                                        .find( item => item.intersects(bounds) );
                                    if (object) {
                                        this._ctx.restore();
                                        return;
                                    }
                                }
                                if ((layer.label.border || {}).visible) {
                                    this._ctx.lineJoin = 'bevel';
                                    this._ctx.lineWidth = ((layer.label.border || {}).width || 5);
                                    this._ctx.strokeStyle = ((layer.label.border || {}).color || 'rgba(0,0,0,0)');
                                    this._ctx.strokeRect(layer._point.x - ((layer.label.background || {}).padding || 5), layer._point.y - ((layer.label.background || {}).padding || 5) - 2, layer.label.width, layer.label.height);
                                }
                                if ((layer.label.background || {}).visible) {
                                    this._ctx.fillStyle = ((layer.label.background || {}).color || 'rgba(0,0,0,0)');
                                    this._ctx.fillRect(layer._point.x - ((layer.label.background || {}).padding || 5), layer._point.y - ((layer.label.background || {}).padding || 5) - 2, layer.label.width, layer.label.height);
                                }
                                this._ctx.textBaseline = 'top';
                                this._ctx.fillStyle = ((layer.label.font || {}).color || 'rgba(0,0,0,1)');
                                this._ctx.fillText(layer.label.text, layer._point.x, layer._point.y);
                                this._drawn.push(layer.label);
                                layer.label.drawn = true;
                                this._ctx.restore();
                            }
                        }
                    }
                },

                //以下内容处理交互，点击事件
                setMode( mode ){
                    this.options.mode = mode;
                },
                //点击事件
                identify( e ) {
                    const point = e.layerPoint;
                    const ids = Object.keys(this._layers).filter( key => {
                        const layer = this._layers[key];
                        return point.x >= layer.label.point.x && point.y >= layer.label.point.y && point.x <= layer.label.point.x + layer.label.width && point.y <= layer.label.point.y + layer.label.height
                    });
                    if (ids.length > 0) {
                        return  this._layers[ids[0]].label;
                    }
                },
                //悬停时，改变鼠标
                _handleMouseHover : function(e, point) {
                    if (this.options.mode != 2) return;
                    const ids = Object.keys(this._layers).filter( key => {
                        const layer = this._layers[key];
                        return point.x >= layer.label.point.x && point.y >= layer.label.point.y && point.x <= layer.label.point.x + layer.label.width && point.y <= layer.label.point.y + layer.label.height
                    });
                    if (ids.length > 0){
                        L.DomUtil.addClass(this._container,
                            'leaflet-interactive'); // change cursor
                    } else {
                        L.DomUtil.removeClass(this._container,
                            'leaflet-interactive'); // change cursor
                    }

                }
            });
    }

    ngOnInit() {
        this.featureService.getAll().subscribe( res => this.features = res );
        this.map = new Map(this.mapDiv.nativeElement, {
            minZoom: 2,
            maxZoom: 18,
            renderer: new Canvas()
        })//.setView([29.576753, 105.030221], 13);
            .setView(this.configService.config.map.center, this.configService.config.map.zoom);
        let tile = new TileLayer('http://{s}.is.autonavi.com/appmaptile?style=7&x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1', {
            maxZoom: 18,
            subdomains: ['webrd01', 'webrd02', 'webrd03', 'webrd04']
        });
        tile.addTo(this.map);

        this.map.createPane("labelPane");
        this.map.getPane('labelPane').style.zIndex = 450;
        this.map.on("click", (e) => {
            console.log(e);
        });
    }

    switch(item) {
        if (!this.map) return;
        if (item.checked) {
            if (item.layer) {
                item.layer.addTo(this.map);
                if (item.labelRenderer) {
                    item.labelRenderer.addTo(this.map);
                }
            } else {
                item.layer = new LayerGroup();
                item.layer.addTo(this.map);
                if (item.label && item.label.field && item.label.field.name) {
                    item.labelRenderer = new L.Label({ pane: "labelPane" });
                    item.labelRenderer.addTo(this.map);
                }
                this.featureService.getGeoJSON(item.name).subscribe((res:any) => {
                    this.draw(item, res.features);
                });
            }
        } else {
            if (item.layer) {
                item.layer.removeFrom(this.map);
                if (item.labelRenderer) {
                    item.labelRenderer.removeFrom(this.map);
                }
            }
        }
    }

    async draw(meta, features){
        const getRGBA = ( color, opacity ) => {
            color = color || '#ff0000';
            opacity = opacity != undefined ? opacity : 1.0;
            //十六进制颜色值的正则表达式
            const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
            // 如果是16进制颜色
            if (color && reg.test(color)) {
                if (color.length === 4) {
                    let sColorNew = "#";
                    for (let i=1; i<4; i+=1) {
                        sColorNew += color.slice(i, i+1).concat(color.slice(i, i+1));
                    }
                    color = sColorNew;
                }
                //处理六位的颜色值
                const sColorChange = [];
                for (let i=1; i<7; i+=2) {
                    sColorChange.push(parseInt("0x"+color.slice(i, i+2)));
                }
                return "rgba(" + sColorChange.join(",") + "," + opacity + ")";
            }
            return color;
        };

        const getDefaultSymbol = () => {
            if (meta.geotype === 1){
                return {
                    type : 10,
                    style : {
                        radius: 6,
                        fillColor: '#ff0000',
                        fillOpacity: 1,
                        color: '#ff0000',
                        opacity: 1,
                        weight: 2
                    }
                }
            } else if (meta.geotype === 2){
                return {
                    type : 20,
                    style : {
                        color: '#ff0000',
                        opacity: 1,
                        weight: 2
                    }
                }
            } else if (meta.geotype === 3){
                return {
                    type : 30,
                    style : {
                        fillColor: '#ff0000',
                        fillOpacity: 1,
                        color: '#ff0000',
                        opacity: 1,
                        weight: 2
                    }
                }
            } else if (meta.geotype === 4){
                return {
                    type : 10,
                    style : {
                        radius: 6,
                        fillColor: '#ff0000',
                        fillOpacity: 1,
                        color: '#ff0000',
                        opacity: 1,
                        weight: 2
                    }
                }
            }
        };

        const getSymbol = (feature) => {
            const defaultSymbol = getDefaultSymbol();
            if (!meta.renderer) return defaultSymbol;
            if (meta.renderer.renderType === 0) {
                return meta.renderer.simple ? meta.renderer.simple.symbol : defaultSymbol;
            } else if (meta.renderer.renderType === 1) {
                if (meta.renderer.category && meta.renderer.category.field && Array.isArray(meta.renderer.category.categories)) {
                    const category = meta.renderer.category.categories.find( item => item.value == feature.properties[meta.renderer.category.field.name]);
                    return category ? (category.symbol || category): defaultSymbol;
                } else {
                    return defaultSymbol;
                }
            } else if (meta.renderer.renderType === 2) {
                if (meta.renderer.class && meta.renderer.class.field && Array.isArray(meta.renderer.class.breaks)) {
                    const category = meta.renderer.class.breaks.find( item => item.min <= feature.properties[meta.renderer.class.field.name] && item.max >= feature.properties[meta.renderer.class.field.name]);
                    return category ? (category.symbol || category) : defaultSymbol;
                } else {
                    return defaultSymbol;
                }
            } else  {
                return defaultSymbol;
            }
        };

        //no renderer
        //if(!meta.renderer) return;

        features.forEach( async (feature) => {
            const symbol = getSymbol(feature);

            if (feature.geometry.type === 'Point') {
                let lng = feature.geometry.coordinates[0], lat = feature.geometry.coordinates[1];
                if (symbol.type === 11) {
                    symbol.style.image = symbol.style.image || new Icon({
                        iconUrl: this.configService.config.api.web_api + "/images/" +  (symbol.style.marker || 'marker.png'),
                        iconSize: [symbol.style.width || 16, symbol.style.height || 16],
                        iconAnchor: [symbol.style.anchorX || 0, symbol.style.anchorY || 0]
                    });
                    meta.layer.addLayer(
                        new Marker([lat,lng], {
                            icon: symbol.style.image,
                            opacity: symbol.style.opacity != undefined ? symbol.style.opacity : 1
                        })
                    );
                } else  {
                    meta.layer.addLayer(
                        new CircleMarker([lat,lng], symbol.style)
                    );
                }
                if (meta.labelRenderer) {
                    meta.labelRenderer.addLabel({
                        text: feature.properties[meta.label.field.name],
                        position: {
                            lat: lat,
                            lng: lng
                        },
                        font: meta.label.font,
                        background: meta.label.background,
                        border: meta.label.border,
                        zoom: meta.label.zoom
                    });
                }
            } else if (feature.geometry.type === 'MultiPoint') {
                const swap = feature.geometry.coordinates.map( point => [point[1],point[0]] ) ;
                feature.geometry.coordinates.forEach( point => {
                    const lat = point[1], lng = point[0];
                    if (symbol.type === 11) {
                        symbol.style.image = symbol.style.image || new Icon({
                            iconUrl: this.configService.config.api.web_api + "/images/" +  (symbol.style.marker || 'marker.png'),
                            iconSize: [symbol.style.width || 16, symbol.style.height || 16],
                            iconAnchor: [symbol.style.anchorX || 0, symbol.style.anchorY || 0]
                        });
                        meta.layer.addLayer(
                            new Marker([lat,lng], {
                                icon: symbol.style.image,
                                opacity: symbol.style.opacity != undefined ? symbol.style.opacity : 1
                            })
                        );
                    } else  {
                        meta.layer.addLayer(
                            new CircleMarker([lat,lng], symbol.style)
                        );
                    }
                    if (meta.labelRenderer) {
                        meta.labelRenderer.addLabel({
                            text: feature.properties[meta.label.field.name],
                            position: {
                                lat: lat,
                                lng: lng
                            },
                            font: meta.label.font,
                            background: meta.label.background,
                            border: meta.label.border,
                            zoom: meta.label.zoom
                        });
                    }
                });

            } else if (feature.geometry.type === 'LineString') {
                const swap = feature.geometry.coordinates.map( point => [point[1],point[0]] ) ;
                const polyline = new Polyline(swap, symbol.style);
                meta.layer.addLayer(
                    polyline
                );
                if (meta.labelRenderer) {
                    meta.labelRenderer.addLabel({
                        text: feature.properties[meta.label.field.name],
                        position: {
                            lat: polyline.getCenter().lat,
                            lng: polyline.getCenter().lng
                        },
                        font: meta.label.font,
                        background: meta.label.background,
                        border: meta.label.border,
                        zoom: meta.label.zoom
                    });
                }
            } else if (feature.geometry.type === 'MultiLineString') {
                const swap = feature.geometry.coordinates.map( line => line.map( point => [point[1],point[0]])) ;
                const polyline = new Polyline(swap, symbol.style);
                meta.layer.addLayer(
                    polyline
                );
                if (meta.labelRenderer) {
                    meta.labelRenderer.addLabel({
                        text: feature.properties[meta.label.field.name],
                        position: {
                            lat: polyline.getCenter().lat,
                            lng: polyline.getCenter().lng
                        },
                        font: meta.label.font,
                        background: meta.label.background,
                        border: meta.label.border,
                        zoom: meta.label.zoom
                    });
                }
            } else if (feature.geometry.type === 'Polygon') {
                const swap = feature.geometry.coordinates.map( ring => ring.map( point => [point[1],point[0]])) ;
                const polygon = new Polygon(swap, symbol.style);
                meta.layer.addLayer(
                    polygon
                );
                if (meta.labelRenderer) {
                    meta.labelRenderer.addLabel({
                        text: feature.properties[meta.label.field.name],
                        position: {
                            lat: polygon.getCenter().lat,
                            lng: polygon.getCenter().lng
                        },
                        font: meta.label.font,
                        background: meta.label.background,
                        border: meta.label.border,
                        zoom: meta.label.zoom
                    });
                }
            } else if (feature.geometry.type === 'MultiPolygon') {
                const swap = feature.geometry.coordinates.map( polygon => polygon.map(ring => ring.map( point => [point[1],point[0]]))) ;
                const polygon = new Polygon(swap, symbol.style);
                meta.layer.addLayer(
                    polygon
                );
                if (meta.labelRenderer) {
                    meta.labelRenderer.addLabel({
                        text: feature.properties[meta.label.field.name],
                        position: {
                            lat: polygon.getCenter().lat,
                            lng: polygon.getCenter().lng
                        },
                        font: meta.label.font,
                        background: meta.label.background,
                        border: meta.label.border,
                        zoom: meta.label.zoom
                    });
                }
            }
        });
    };

}
