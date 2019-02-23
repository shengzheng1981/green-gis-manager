import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {CircleMarker, GeoJSON, Map, TileLayer} from 'leaflet';
import {HttpClient} from '@angular/common/http';
import geojsonvt from 'geojson-vt';
declare var AMap: any;
@Component({
    selector: 'app-leafgao',
    templateUrl: './leafgao.component.html',
    styleUrls: ['./leafgao.component.css']
})
export class LeafgaoComponent implements OnInit {
    @ViewChild('map') mapDiv: ElementRef;
    @ViewChild('amap') aMapDiv: ElementRef;

    constructor(private http: HttpClient) {
    }

    ngOnInit() {
        const amap = new AMap.Map(this.aMapDiv.nativeElement, {
            zoom: 13,
            center: [109.522854, 18.267234],
            animateEnable: false,
            dragEnable: false,
            zoomEnable: false,
            doubleClickZoom: false,
            keyboardEnable: false,
            scrollWheel: false,
            expandZoomRange: true,
            zooms: [3, 20],
            mapStyle: "amap://styles/1d037584f9de2c75b6425884278f6fc9",
            features: ['bg'],
            viewMode: '2D'
        });
        const map = new Map(this.mapDiv.nativeElement, {
            //renderer: new SVG()
            minZoom: 3,
            maxZoom: 20,
            zoomAnimation: false
        });
        map.on('zoom', function (evt) {
            amap.setZoom(evt.target.getZoom());

        });

        map.on('move', function (evt) {
            const pt = evt.target.getCenter();
            amap.setZoomAndCenter(evt.target.getZoom(), [pt.lng, pt.lat]);
        });

        map.setView([18.267234, 109.522854], 13);

        let tile = new TileLayer('http://localhost:4000/class/junctions/image/tile/{x}/{y}/{z}', {
            maxZoom: 20
        });
        tile.addTo(map);
/*        console.time('get json');
        this.http.get('http://localhost:4000/geojson/junctions').subscribe(res => {
            console.timeEnd('get json');
            console.time('create layer');
            const json = new GeoJSON(<any>(res), {
                pointToLayer: function (geoJsonPoint, latlng) {
                    return new CircleMarker(latlng, {
                        radius: 3,
                        fillColor: 'blue',
                        color: 'blue',
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.8
                    });
                }
            });
            //json.addTo(map);
            console.timeEnd('create layer');
        });*/
    }

}
