import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Map, TileLayer, Marker, Icon, CircleMarker, GeoJSON, Canvas} from 'leaflet';
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
            maxZoom: 18,
            renderer: new Canvas()
        })//.setView([29.576753, 105.030221], 13);
            .setView([18.267234, 109.522854], 13);
        let tile = new TileLayer('http://{s}.is.autonavi.com/appmaptile?style=7&x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1', {
            maxZoom: 18,
            subdomains: ['webrd01', 'webrd02', 'webrd03', 'webrd04']
        });
        tile.addTo(this.map);
        this.map.on("click", (e) => {
            console.log(e);
        });
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
                            pointToLayer:  (geoJsonPoint, latlng) => {
                                return new CircleMarker(latlng, {
                                    radius: 6,
                                    fillColor: 'red',
                                    color: 'red',
                                    weight: 1,
                                    opacity: 1,
                                    fillOpacity: 0.5
                                });
                                /*return new Marker(latlng, {
                                    icon: new Icon({
                                        iconUrl: 'assets/img/map/sewage.svg',
                                        iconSize: [16, 16],
                                        iconAnchor: [0, 0]
                                    })
                                });*/
                            },
                            onEachFeature:   (feature, layer) => {
                                layer.on({
                                    click:  (e) => {
                                        console.log(e.target);
                                    },
                                    mouseover: (e) => {
                                        const layer = e.target;

                                        layer.setStyle({
                                            radius: 6,
                                            fillColor: 'rgb(0, 255, 255)',
                                            color: 'rgb(0, 255, 255)',
                                            weight: 1,
                                            opacity: 1,
                                            fillOpacity: 0.5
                                        });

                                        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                                            layer.bringToFront();
                                        }
                                    },
                                    mouseout: (e) => {
                                        item.layer.resetStyle(e.target);
                                    }
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
