import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {MapService} from '../../../shared/services/map.service';
import {LabelService} from '../../../shared/services/label.service';
import {Map, TileLayer, Marker, Icon, CircleMarker, GeoJSON, Canvas, LayerGroup, Polyline, Polygon} from 'leaflet';
import {default as swal} from "sweetalert2";
import {ConfigService} from '../../../shared/services/config.service';

@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
    private mapDivRef: ElementRef;
    maps: any = [];
    map: any;
    label: any;
    renderer: any;
    lmap: any;
    option : any = {
        label: {
            mode: 0          //0 for none 1 for create 2 for select
        }
    };

    @ViewChild('mapDiv') set mapDiv(elRef: ElementRef) {
        this.mapDivRef = elRef;
        this.initMap();
    }

    constructor(private mapService: MapService, private labelService:LabelService, private configService: ConfigService) {
        L.Label = L.Canvas
            .extend({
                options : {
                    mode: 0              //0 default 1 create 2 select(identify)
                },

                initialize : function(options) {
                    options = L.Util.setOptions(this, options);
                    //add
                    L.Util.stamp(this);
                    this._layers = {};
                    this._labels = [];
                },

                onAdd: function () {
                    L.Canvas.prototype.onAdd.call(this);
                    // Redraw vectors since canvas is cleared upon removal,
                    // in case of removing the renderer itself from the map.
                    //this._draw();
                    if (!this._map) return;
                    this._labels.forEach( item => {
                        item.addTo(this._map);
                        this._text(item);
                    });
                    this._labels = [];
                },

                addLabel: function(label) {
                    const circle = new L.CircleMarker([label.position.lat, label.position.lng], {radius: 0, stroke: false, renderer: this});
                    circle.label = label;
                    if (this._map) {
                        circle.addTo(this._map);
                        this._text(circle);
                    } else {
                        this._labels.push(circle);
                    }
                },

                removeLabel: function(label) {
                    const item = Object.keys(this._layers).find( key => {
                        const circle = this._layers[key];
                        return circle && circle.label && circle.label._id == label._id;
                    });
                    item && this._layers[item].removeFrom(this._map);
                    this._redraw();
                },

                clearLabel: function() {
                    Object.keys(this._layers).forEach( key => {
                        const circle = this._layers[key];
                        circle.removeFrom(this._map);
                    });
                    this._layers = {};
                    this._labels = [];
                    this._redraw();
                },

                redrawLabel: function(label) {
                    const item = Object.keys(this._layers).find( key => {
                        const layer = this._layers[key];
                        return layer && layer.label && layer.label._id == label._id;
                    });
                    item && this._updateCircle(this._layers[item]);
                },

                redraw: function() {
                    this._redraw();
                },

                _updateCircle : function(layer) {
                    L.Canvas.prototype._updateCircle.call(this, layer);
                    this._text(layer);
                },

                _text : function(layer) {
                    if (layer.label && layer.label.text != undefined) {
                        const zoom = this._map.getZoom();
                        const min = ((layer.label.zoom || {}).min || 1);
                        const max = ((layer.label.zoom || {}).max || 18);
                        if (zoom >= min && zoom <= max) {
                            this._ctx.save();
                            this._ctx.globalAlpha = 1;
                            layer.label.point = layer._point;
                            //const point = this._map.latLngToContainerPoint([label.position.lat, label.position.lng]);
                            this._ctx.font = ((layer.label.font || {}).size || 12) + 'px ' + ((layer.label.font || {}).family || 'YaHei') +  ' ' + ((layer.label.font || {}).bold || 'Bold');
                            this._ctx.fillStyle = ((layer.label.background || {}).color || 'rgba(0,0,0,0)');
                            this._ctx.textBaseline = 'top';
                            layer.label.width = this._ctx.measureText(layer.label.text).width + ((layer.label.background || {}).padding || 5) * 2;
                            layer.label.height = ((layer.label.font || {}).size || 12)  + ((layer.label.background || {}).padding || 5) * 2;
                            if ((layer.label.border || {}).visible) {
                                this._ctx.lineJoin = 'bevel';
                                this._ctx.lineWidth = ((layer.label.border || {}).width || 5);
                                this._ctx.strokeStyle = ((layer.label.border || {}).color || 'rgba(0,0,0,0)');
                                this._ctx.strokeRect(layer._point.x - ((layer.label.background || {}).padding || 5), layer._point.y - ((layer.label.background || {}).padding || 5) - 2, layer.label.width, layer.label.height);
                            }
                            if ((layer.label.background || {}).visible) {
                                this._ctx.fillRect(layer._point.x - ((layer.label.background || {}).padding || 5), layer._point.y - ((layer.label.background || {}).padding || 5) - 2, layer.label.width, layer.label.height);
                            }
                            this._ctx.fillStyle = ((layer.label.font || {}).color || 'rgba(0,0,0,1)');
                            this._ctx.fillText(layer.label.text, layer._point.x, layer._point.y);
                            this._ctx.restore();
                        }
                    }
                },

                setMode( mode ){
                    this.options.mode = mode;
                },

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
        this.init();
    }

    async init(){
        this.maps = await this.mapService.getAll().toPromise();
        this.map = undefined;
    }

    //map
    initMap(){
        if (!this.mapDivRef || this.lmap) return;
        this.lmap = new Map(this.mapDivRef.nativeElement, {
            minZoom: 2,
            maxZoom: 18,
            renderer: new Canvas()
        })//.setView([29.576753, 105.030221], 13);
            .setView(this.configService.config.map.center, this.configService.config.map.zoom);
        let tile = new TileLayer('http://{s}.is.autonavi.com/appmaptile?style=7&x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1', {
            maxZoom: 18,
            subdomains: ['webrd01', 'webrd02', 'webrd03', 'webrd04']
        });
        tile.addTo(this.lmap);

        this.lmap.on("click", (e) => {
            if (!this.renderer || !this.map) return;
            if (this.option.label.mode == 1) {
                //create label
                this.label && this.renderer.removeLabel(this.label);
                this.label = {
                    _id: 0,
                    text: "Label",
                    position: {
                        lat: e.latlng.lat,
                        lng: e.latlng.lng
                    },
                    font : {
                        size: 12,
                        color: "#000000",
                        family: "YaHei",
                        bold: 'bold'
                    },
                    background: {
                        visible: false,
                        color: "#000000",
                        padding: 5
                    },
                    border: {
                        visible: false,
                        color: "#000000",
                        width: 5
                    },
                    zoom: {
                        min: 1,
                        max: 18
                    },
                    map: this.map
                };
                this.renderer.addLabel(this.label);
            } else if (this.option.label.mode == 2) {
                this.label = this.renderer.identify(e);
            }
        });

        this.lmap.createPane("labelPane");
        this.renderer = new L.Label({ pane: "labelPane" });
        this.renderer.addTo(this.lmap);
        /*setTimeout(() => {
            this.label = {
                _id: 1,
                text: "Hello fghjy 中文",
                position:{
                    lat: 39,
                    lng: 117
                },
                font: {
                    color: "#00ffff",
                    size: 48
                },
                background: {
                    color: "#ff0000",
                    padding: 5
                },
                border: {
                    color: "#ff0000",
                    width: 5
                },
                zoom: {
                    min: 3,
                    max: 10
                }
            };
            this.renderer.addLabel(this.label);
        });*/
        this.initLabel();
    }

    async active(item) {
        this.map = item;
        this.initLabel();
    }

    create(){
        this.mapService.create({}).subscribe( res => {
            if (res.result){
                this.maps.push(res.doc);
                this.active(res.doc);
            } else {
                swal({
                    title: 'warning',
                    text: 'create fail!',
                    type: 'warning',
                    confirmButtonText: 'OK'
                });
            }
        });
    }

    delete(){
        if (!this.map) return;
        swal({
            title: 'warning',
            text: "confirm delete map " + this.map.name + " ?",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel'
        }).then(result => {
            if (result.value) {
                this.mapService.delete(this.map._id).subscribe( res => {
                    if (res.result){
                        swal({
                            title: 'information',
                            text: 'delete success!',
                            type: 'success',
                            confirmButtonText: 'OK'
                        });
                        this.init();
                    } else {
                        swal({
                            title: 'warning',
                            text: 'delete fail!',
                            type: 'warning',
                            confirmButtonText: 'OK'
                        });
                    }
                });
            }
        });
    }

    update(){
        if (!this.map) return;
        swal({
            title: 'warning',
            text: "confirm update map " + this.map.name + " ?",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel'
        }).then(result => {
            if (result.value) {
                this.mapService.update(this.map).subscribe( res => {
                    if (res.result){
                        swal({
                            title: 'information',
                            text: 'update success!',
                            type: 'success',
                            confirmButtonText: 'OK'
                        });
                    } else {
                        swal({
                            title: 'warning',
                            text: 'update fail!',
                            type: 'warning',
                            confirmButtonText: 'OK'
                        });
                    }
                });
            }
        });
    }

    //label
    async initLabel(){
        if (!this.map || !this.renderer) return;
        const labels = await this.labelService.getByMap(this.map._id).toPromise();
        this.renderer.clearLabel();
        labels.forEach( label => {
            this.renderer.addLabel(label);
        });
        this.label = undefined;
    }

    switchTool(event, mode){
        event.stopPropagation();
        event.preventDefault();
        this.option.label.mode = this.option.label.mode == mode ? 0:mode;
        this.renderer && this.renderer.setMode(this.option.label.mode);
    }

    redraw(){
        if (this.label && this.renderer) this.renderer.redraw();
    }

    deleteLabel(){
        if (!this.label) return;
        swal({
            title: 'warning',
            text: "confirm delete label " + this.label.text + " ?",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel'
        }).then(result => {
            if (result.value) {
                this.labelService.delete(this.label._id).subscribe( res => {
                    if (res.result){
                        swal({
                            title: 'information',
                            text: 'delete success!',
                            type: 'success',
                            confirmButtonText: 'OK'
                        });
                        this.renderer.removeLabel(this.label);
                        this.label = undefined;
                    } else {
                        swal({
                            title: 'warning',
                            text: 'delete fail!',
                            type: 'warning',
                            confirmButtonText: 'OK'
                        });
                    }
                });
            }
        });
    }

    saveLabel(){
        if (this.option.label.mode == 1) {
            const label = Object.assign({}, this.label);
            delete label._id;
            this.labelService.create(label).subscribe( res => {
                this.label._id = res.doc._id;
            })
        } else {
            this.labelService.update(this.label).subscribe()
        }
    }
}
