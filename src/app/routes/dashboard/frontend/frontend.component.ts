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
                if(!options.name){
                    throw new Error('need feature class name!')
                }
            },
            createTile: function(coords, done){
                if(this.options.name){
                    // create a <canvas> element for drawing
                    var tile = L.DomUtil.create('canvas', 'leaflet-tile');
                    // setup tile width and height according to the options
                    var size = this.getTileSize();
                    tile.width = size.x;
                    tile.height = size.y;
                    // draw something asynchronously and pass the tile to the done() callback
                    $.ajax({
                        url : this.options.url + '/tiles/vector/' + this.options.name + '/' + coords.x + '/' + coords.y + '/' + coords.z,
                        dataType : 'json',
                        success:  (features) => {
                            if (Array.isArray(features)){
                                const ctx = tile.getContext('2d');
                                ctx.strokeStyle = 'red';
                                ctx.fillStyle = 'rgba(255,0,0,0.5)';
                                features.forEach(feature => {
                                    if (feature.geometry.type === 'Point') {
                                        let lng = feature.geometry.coordinates[0], lat = feature.geometry.coordinates[1];
                                        let tileXY = this.lngLat2Tile(lng, lat, coords.z);
                                        let pixelXY = this.lngLat2Pixel(lng, lat, coords.z);
                                        let pixelX = pixelXY.pixelX + (tileXY.tileX - coords.x) * 256;
                                        let pixelY = pixelXY.pixelY + (tileXY.tileY - coords.y) * 256;
                                        ctx.beginPath(); //Start path
                                        ctx.arc(pixelX, pixelY, 6, 0, Math.PI * 2, true); // Draw a point using the arc function of the canvas with a point structure.
                                        ctx.fill();
                                    } else if (feature.geometry.type === 'LineString') {
                                        ctx.beginPath();
                                        feature.geometry.coordinates.forEach( (point,index) => {
                                            let lng = point[0], lat = point[1];
                                            let tileXY = this.lngLat2Tile(lng, lat, coords.z);
                                            let pixelXY = this.lngLat2Pixel(lng, lat, coords.z);
                                            let pixelX = pixelXY.pixelX + (tileXY.tileX - coords.x) * 256;
                                            let pixelY = pixelXY.pixelY + (tileXY.tileY - coords.y) * 256;
                                            if (index === 0){
                                                ctx.moveTo(pixelX, pixelY);
                                            } else {
                                                ctx.lineTo(pixelX, pixelY);
                                            }
                                        });
                                        ctx.stroke();
                                    } else if (feature.geometry.type === 'Polygon') {
                                        ctx.beginPath();
                                        feature.geometry.coordinates.forEach( ring => {
                                            ring.forEach( (point, index) => {
                                                let lng = point[0], lat = point[1];
                                                let tileXY = this.lngLat2Tile(lng, lat, coords.z);
                                                let pixelXY = this.lngLat2Pixel(lng, lat, coords.z);
                                                let pixelX = pixelXY.pixelX + (tileXY.tileX - coords.x) * 256;
                                                let pixelY = pixelXY.pixelY + (tileXY.tileY - coords.y) * 256;
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
                                        feature.geometry.coordinates.forEach( polygon => {
                                            ctx.beginPath();
                                            polygon.forEach( ring => {
                                                ring.forEach( (point, index) => {
                                                    let lng = point[0], lat = point[1];
                                                    let tileXY = this.lngLat2Tile(lng, lat, coords.z);
                                                    let pixelXY = this.lngLat2Pixel(lng, lat, coords.z);
                                                    let pixelX = pixelXY.pixelX + (tileXY.tileX - coords.x) * 256;
                                                    let pixelY = pixelXY.pixelY + (tileXY.tileY - coords.y) * 256;
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
            .setView([18.267234, 109.522854], 13);
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
                    name: item.name,
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
