import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Map, TileLayer, Marker, Icon, CircleMarker, GeoJSON, Canvas, LayerGroup, Polyline, Polygon} from 'leaflet';
import {FeatureService} from '../../../shared/services/feature.service';
import {ConfigService} from '../../../shared/services/config.service';
import {HttpClient} from '@angular/common/http';
import io from 'socket.io-client';

@Component({
  selector: 'app-stream',
  templateUrl: './stream.component.html',
  styleUrls: ['./stream.component.css']
})
export class StreamComponent implements OnInit {

    features = [];
    map : any;

    @ViewChild('map', { static: true }) mapDiv: ElementRef;

    constructor(private http: HttpClient, private featureService: FeatureService, private configService: ConfigService) {
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

    }

    switch(item) {
        if (!this.map) return;
        if (item.checked) {
            if (item.layer) {
                item.layer.addTo(this.map);
            } else {
                const socket = io(this.configService.config.api.web_api);
                item.layer = new LayerGroup();
                item.layer.addTo(this.map);
                socket.emit('stream', { name: item.name});
                socket.on('streaming',  (features) =>{
                    this.draw(item, features);
                });
            }
        } else {
            if (item.layer) {
                item.layer.removeFrom(this.map);
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
            if (meta.geomType === 1){
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
            } else if (meta.geomType === 2){
                return {
                    type : 20,
                    style : {
                        color: '#ff0000',
                        opacity: 1,
                        weight: 2
                    }
                }
            } else if (meta.geomType === 3){
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
            } else if (meta.geomType === 4){
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
        if(!meta.renderer) return;

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
