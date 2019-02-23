import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Map, TileLayer, CircleMarker, GeoJSON} from 'leaflet';
import {HttpClient} from '@angular/common/http';
import {FeatureService} from '../../../shared/services/feature.service';

@Component({
    selector: 'app-geojson',
    templateUrl: './geojson.component.html',
    styleUrls: ['./geojson.component.css']
})
export class GeojsonComponent implements OnInit {

    features = [];
    map : any;

    @ViewChild('map') mapDiv: ElementRef;

    constructor(private http: HttpClient, private featureService: FeatureService) {
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
                this.http.get(this.featureService.url + '/geojson/' + item.name).subscribe(res => {
                    if (item.geomType == 1) {
                        item.layer = new GeoJSON(<any>(res), {
                            pointToLayer: function (geoJsonPoint, latlng) {
                                return new CircleMarker(latlng, {
                                    radius: 6,
                                    fillColor: 'red',
                                    color: 'red',
                                    weight: 1,
                                    opacity: 1,
                                    fillOpacity: 0.5
                                });
                            }
                        });
                        item.layer.addTo(this.map);
                    } else if (item.geomType == 2) {
                        item.layer = new GeoJSON(<any>(res), {
                            style: function (geoJsonFeature) {
                                return {
                                    color: 'red',
                                    weight: 1
                                }
                            }
                        });
                        item.layer.addTo(this.map);
                    } else if (item.geomType == 3) {
                        item.layer = new GeoJSON(<any>(res), {
                            style: function (geoJsonFeature) {
                                return {
                                    color: 'red',
                                    weight: 1,
                                    fillColor: 'red',
                                    fillOpacity: 0.5
                                }
                            }
                        });
                        item.layer.addTo(this.map);
                    }
                });
            }
        } else {
            if (item.layer) {
                item.layer.removeFrom(this.map);
            }
        }
    }

}
