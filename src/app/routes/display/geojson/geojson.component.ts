import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {FeatureService} from '../../../shared/services/feature.service';
import {ConfigService} from '../../../shared/services/config.service';
import {
    Feature,
    FeatureClass,
    FeatureLayer, MultiplePolygon,
    Point,
    Polygon,
    Polyline, SimpleFillSymbol,
    SimpleLineSymbol,
    SimpleMarkerSymbol,
    SimplePointSymbol
} from 'green-gis';
import {LayerService} from '../../../shared/services/layer.service';

@Component({
    selector: 'app-geojson',
    templateUrl: './geojson.component.html',
    styleUrls: ['./geojson.component.css']
})
export class GeoJSONComponent implements OnInit {

    layers = [];
    map : any;

    @ViewChild('map', { static: true }) mapDiv: ElementRef;

    constructor(private http: HttpClient, private featureService: FeatureService, private layerService: LayerService, private configService: ConfigService) {
    }

    ngOnInit() {
        this.layerService.getAll().subscribe( res => this.layers = res );
    }

    mapInit(event) {
        this.map = event.map;
    }

    switch(layer) {
        if (!this.map) return;
        if (layer.checked) {
            if (layer.view) {
                layer.view.visible = true;
                this.map.redraw();
            } else {
                this._drawLayer(layer);
            }
        } else {
            if (layer.view) {
                layer.view.visible = false;
                this.map.redraw();
            }
        }
    }

    _drawLayer(layer){
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
            if (layer.class.geotype === 1){
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
            } else if (layer.class.geotype === 2){
                return {
                    type : 20,
                    style : {
                        color: '#ff0000',
                        opacity: 1,
                        weight: 2
                    }
                }
            } else if (layer.class.geotype === 3){
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
            } else if (layer.class.geotype === 4){
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
            if (!layer.renderer) return defaultSymbol;
            if (layer.renderer.method === 0) {
                return layer.renderer.simple ? layer.renderer.simple.symbol : defaultSymbol;
            } else if (layer.renderer.method === 1) {
                if (layer.renderer.category && layer.renderer.category.field && Array.isArray(layer.renderer.category.categories)) {
                    const category = layer.renderer.category.categories.find( item => item.value == feature.properties[layer.renderer.category.field.name]);
                    return category ? (category.symbol || category): defaultSymbol;
                } else {
                    return defaultSymbol;
                }
            } else if (layer.renderer.method === 2) {
                if (layer.renderer.class && layer.renderer.class.field && Array.isArray(layer.renderer.class.breaks)) {
                    const category = layer.renderer.class.breaks.find( item => item.min <= feature.properties[layer.renderer.class.field.name] && item.max >= feature.properties[layer.renderer.class.field.name]);
                    return category ? (category.symbol || category) : defaultSymbol;
                } else {
                    return defaultSymbol;
                }
            } else  {
                return defaultSymbol;
            }
        };
        this.featureService.getGeoJSON(layer.class.name).subscribe((res:any) => {
            layer.view = new FeatureLayer();
            layer.view.featureClass = new FeatureClass(layer.class.geotype);
            res.features.forEach(feature => {
                const symbol = getSymbol(feature);
                if (feature.geometry.type === 'Point') {
                    const point = new Point(feature.geometry.coordinates[0], feature.geometry.coordinates[1]);
                    if (symbol.type === 11) {
                        const marker = new SimpleMarkerSymbol();
                        marker.width = symbol.style.width || 20;
                        marker.height = symbol.style.height || 20;
                        marker.offsetX = -(symbol.style.offsetX || (marker.width)/2);
                        marker.offsetY = -(symbol.style.offsetY || (marker.height)/2);
                        marker.url = this.configService.config.api.web_api + "/images/" + (symbol.style.icon || symbol.style.marker);
                        layer.view.featureClass.addFeature(new Feature(point, feature.properties, marker));
                    } else  {
                        const pointSymbol = new SimplePointSymbol();
                        pointSymbol.fillStyle = symbol.style.fillColor ? symbol.style.fillColor +  Math.floor(((symbol.style.fillOpacity || 0)) * 255).toString(16).padStart(2, "0") : "#ff000088";
                        pointSymbol.strokeStyle = symbol.style.strokeColor || "#ff0000";
                        pointSymbol.radius = symbol.style.radius || 6;
                        layer.view.featureClass.addFeature(new Feature(point, feature.properties, pointSymbol));
                    }
                } else if (feature.geometry.type === 'LineString') {
                    const polyline = new Polyline(feature.geometry.coordinates);
                    const lineSymbol = new SimpleLineSymbol();
                    lineSymbol.lineWidth = symbol.style.lineWidth || 2;
                    lineSymbol.strokeStyle = symbol.style.strokeColor || "#ff0000";
                    layer.view.featureClass.addFeature(new Feature(polyline, feature.properties, lineSymbol));
                } else if (feature.geometry.type === 'Polygon') {
                    const polygon = new Polygon(feature.geometry.coordinates);
                    const fillSymbol = new SimpleFillSymbol();
                    fillSymbol.lineWidth = symbol.style.lineWidth || 2;
                    fillSymbol.strokeStyle = symbol.style.strokeColor || "#ff0000";
                    fillSymbol.fillStyle = symbol.style.fillColor ? symbol.style.fillColor +  Math.floor((symbol.style.fillOpacity || 0) * 255).toString(16).padStart(2, "0") : "#ff000088";
                    layer.view.featureClass.addFeature(new Feature(polygon, feature.properties, fillSymbol));
                } else if (feature.geometry.type === 'MultiPolygon') {
                    const polygon = new MultiplePolygon(feature.geometry.coordinates);
                    const fillSymbol = new SimpleFillSymbol();
                    fillSymbol.lineWidth = symbol.style.lineWidth || 2;
                    fillSymbol.strokeStyle = symbol.style.strokeColor || "#ff0000";
                    fillSymbol.fillStyle = symbol.style.fillColor ? symbol.style.fillColor +  Math.floor((symbol.style.fillOpacity || 0) * 255).toString(16).padStart(2, "0") : "#ff000088";
                    layer.view.featureClass.addFeature(new Feature(polygon, feature.properties, fillSymbol));
                }
            });
            this.map.addLayer(layer.view);
            this.map.redraw();
        });

    }

}
