import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Map, TileLayer} from 'leaflet';
import {FeatureService} from '../../../shared/services/feature.service';
import {HttpClient} from '@angular/common/http';
import {ConfigService} from '../../../shared/services/config.service';

@Component({
  selector: 'app-frontend',
  templateUrl: './frontend.component.html',
  styleUrls: ['./frontend.component.css']
})
export class FrontendComponent implements OnInit {

    features = [];
    map : any;

    @ViewChild('map') mapDiv: ElementRef;

    constructor(private http: HttpClient, private featureService: FeatureService, private configService: ConfigService) {
        L.VectorTileLayer = L.GridLayer.extend({
            initialize: function(options) {
                L.setOptions(this, options);
                L.GridLayer.prototype.initialize.apply(this, arguments);
                if(!options.meta){
                    throw new Error('need feature class!')
                }
            },
            createTile: function(coords, done){
                if(this.options.meta){
                    // create a <canvas> element for drawing
                    var tile = L.DomUtil.create('canvas', 'leaflet-tile');
                    // setup tile width and height according to the options
                    var size = this.getTileSize();
                    tile.width = size.x;
                    tile.height = size.y;
                    // draw something asynchronously and pass the tile to the done() callback
                    $.ajax({
                        url : this.options.url + '/tiles/vector/' + this.options.meta.name + '/' + coords.x + '/' + coords.y + '/' + coords.z,
                        dataType : 'json',
                        success:  (features) => {
                            if (Array.isArray(features)){
                                const ctx = tile.getContext('2d');
                                this.draw(ctx, this.options.meta, coords.x, coords.y, coords.z, features);
                            }
                            done(null, tile);
                        }
                    });
                    return tile;
                } else {
                    done(new Error('need feature class name!'), null);
                    return null;
                }

            },
            draw: async function(ctx, meta, x, y, z, features){

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
                    if (meta.geomType === 0){
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
                    } else if (meta.geomType === 1){
                        return {
                            type : 10,
                            style : {
                                color: '#ff0000',
                                opacity: 1,
                                weight: 2
                            }
                        }
                    } else if (meta.geomType === 2){
                        return {
                            type : 10,
                            style : {
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
                            const category = meta.renderer.category.categories.find( item => item.value == feature.properties[meta.renderer.category.field]);
                            return category ? category.symbol : defaultSymbol;
                        } else {
                            return defaultSymbol;
                        }
                    } else if (meta.renderer.renderType === 2) {
                        if (meta.renderer.class && meta.renderer.class.field && Array.isArray(meta.renderer.class.breaks)) {
                            const category = meta.renderer.class.breaks.find( item => item.min <= feature.properties[meta.renderer.class.field] && item.max >= feature.properties[meta.renderer.class.field]);
                            return category ? category.symbol : defaultSymbol;
                        } else {
                            return defaultSymbol;
                        }
                    } else  {
                        return defaultSymbol;
                    }
                };

                const getImage = (path) => {
                    return new Promise(  (resolve, reject) => {
                        // Create a new image from JavaScript
                        let image = new Image();
                        // Handler onload -> `resolve`
                        image.onload  = () => resolve(image);
                        // If the image fails to be downloaded -> `reject`
                        image.onerror = reject;
                        // Apply the path as `src` to the image -> browser fetches it
                        image.src = path;
                    });
                };

                //no renderer
                if(!meta.renderer) return;

                //default
                ctx.strokeStyle = 'rgba(255,0,0,1)';
                ctx.fillStyle = 'rgba(255,0,0,1)';
                ctx.lineWidth = 2;

                features.forEach( async (feature) => {
                    const symbol = getSymbol(feature);

                    if (feature.geometry.type === 'Point') {
                        let lng = feature.geometry.coordinates[0], lat = feature.geometry.coordinates[1];
                        let tileXY = this.lngLat2Tile(lng, lat, z);
                        let pixelXY = this.lngLat2Pixel(lng, lat, z);
                        let pixelX = pixelXY.pixelX + (tileXY.tileX - x) * 256;
                        let pixelY = pixelXY.pixelY + (tileXY.tileY - y) * 256;

                        if (symbol.type === 11) {
                            if (symbol.style.image) {
                                ctx.drawImage(symbol.style.image, pixelX, pixelY, symbol.style.width, symbol.style.height);
                            } else {
                                symbol.style.image = await getImage(this.options.url + "/images/" +  (symbol.style.marker || 'marker.png'));
                                ctx.drawImage(symbol.style.image, pixelX, pixelY, symbol.style.width, symbol.style.height);
                            }
                        } else  {
                            ctx.strokeStyle = getRGBA(symbol.style.color, symbol.style.opacity);
                            ctx.fillStyle = getRGBA(symbol.style.fillColor, symbol.style.fillOpacity);
                            ctx.beginPath(); //Start path
                            ctx.arc(pixelX, pixelY, symbol.style.radius, 0, Math.PI * 2, true); // Draw a point using the arc function of the canvas with a point structure.
                            ctx.fill();
                            ctx.stroke();
                        }

                    } else if (feature.geometry.type === 'LineString') {
                        ctx.strokeStyle = getRGBA(symbol.style.color, symbol.style.opacity);
                        ctx.lineWidth = symbol.style.weight ? (symbol.style.weight || 2) : 2;
                        ctx.beginPath();
                        feature.geometry.coordinates.forEach( (point,index) => {
                            let lng = point[0], lat = point[1];
                            let tileXY = this.lngLat2Tile(lng, lat, z);
                            let pixelXY = this.lngLat2Pixel(lng, lat, z);
                            let pixelX = pixelXY.pixelX + (tileXY.tileX - x) * 256;
                            let pixelY = pixelXY.pixelY + (tileXY.tileY - y) * 256;
                            if (index === 0){
                                ctx.moveTo(pixelX, pixelY);
                            } else {
                                ctx.lineTo(pixelX, pixelY);
                            }
                        });
                        ctx.stroke();
                    } else if (feature.geometry.type === 'Polygon') {
                        ctx.strokeStyle = getRGBA(symbol.style.color, symbol.style.opacity);
                        ctx.fillStyle = getRGBA(symbol.style.fillColor, symbol.style.fillOpacity);
                        ctx.beginPath();
                        feature.geometry.coordinates.forEach( ring => {
                            ring.forEach( (point, index) => {
                                let lng = point[0], lat = point[1];
                                let tileXY = this.lngLat2Tile(lng, lat, z);
                                let pixelXY = this.lngLat2Pixel(lng, lat, z);
                                let pixelX = pixelXY.pixelX + (tileXY.tileX - x) * 256;
                                let pixelY = pixelXY.pixelY + (tileXY.tileY - y) * 256;
                                if (index === 0){
                                    ctx.moveTo(pixelX, pixelY);
                                } else {
                                    ctx.lineTo(pixelX, pixelY);
                                }
                            });
                            ctx.closePath();
                        });
                        ctx.fill();
                        ctx.stroke();
                    } else if (feature.geometry.type === 'MultiPolygon') {
                        ctx.strokeStyle = getRGBA(symbol.style.color, symbol.style.opacity);
                        ctx.fillStyle = getRGBA(symbol.style.fillColor, symbol.style.fillOpacity);
                        feature.geometry.coordinates.forEach( polygon => {
                            ctx.beginPath();
                            polygon.forEach( ring => {
                                ring.forEach( (point, index) => {
                                    let lng = point[0], lat = point[1];
                                    let tileXY = this.lngLat2Tile(lng, lat, z);
                                    let pixelXY = this.lngLat2Pixel(lng, lat, z);
                                    let pixelX = pixelXY.pixelX + (tileXY.tileX - x) * 256;
                                    let pixelY = pixelXY.pixelY + (tileXY.tileY - y) * 256;
                                    if (index === 0){
                                        ctx.moveTo(pixelX, pixelY);
                                    } else {
                                        ctx.lineTo(pixelX, pixelY);
                                    }
                                });
                                ctx.closePath();
                            });
                            ctx.fill();
                            ctx.stroke();
                        });
                    }
                });
            },
            lngLat2Tile: function(lng, lat, z){
                let tileX = Math.floor( (lng+180) / 360 * Math.pow(2, z) );
                let tileY = Math.floor( ( 1/2 - ( Math.log(Math.tan(lat * Math.PI/180) + 1 / Math.cos(lat * Math.PI/180)) ) / (2 * Math.PI) ) * Math.pow(2, z) );
                return {
                    tileX : tileX,
                    tileY : tileY
                }
            },

            lngLat2Pixel: function(lng, lat, z){
                let pixelX = Math.floor( ( (lng + 180) / 360 * Math.pow(2, z) * 256 ) % 256 );
                let pixelY = Math.floor( ( ( 1 - ( Math.log(Math.tan(lat * Math.PI/180) + 1 / Math.cos(lat * Math.PI/180)) ) / (2 * Math.PI) )  * Math.pow(2, z) * 256 ) % 256 );
                return {
                    pixelX : pixelX,
                    pixelY : pixelY
                }
            }
        });

        L.vectorTileLayer = function (options) {
            return new L.VectorTileLayer(options);
        };
    }

    ngOnInit() {
        this.featureService.getAll().subscribe( res => this.features = res );
        this.map = new Map(this.mapDiv.nativeElement, {
            minZoom: 2,
            maxZoom: 18
            //renderer: new SVG()
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
                item.layer = L.vectorTileLayer({
                    meta: item,
                    url: this.configService.config.api.web_api
                });
                item.layer.addTo(this.map);
            }
        } else {
            if (item.layer) {
                item.layer.removeFrom(this.map);
            }
        }
    }
}
