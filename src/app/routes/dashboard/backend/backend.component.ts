import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {CircleMarker, GeoJSON, Map, TileLayer} from 'leaflet';
import {FeatureService} from '../../../shared/services/feature.service';
import {HttpClient} from '@angular/common/http';
import {ConfigService} from '../../../shared/services/config.service';

@Component({
  selector: 'app-backend',
  templateUrl: './backend.component.html',
  styleUrls: ['./backend.component.css']
})
export class BackendComponent implements OnInit {

    features = [];
    map : any;

    @ViewChild('map') mapDiv: ElementRef;

    constructor(private http: HttpClient, private featureService: FeatureService, private configService: ConfigService) {
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
                item.layer = new TileLayer(this.configService.config.api.web_api + '/tiles/image/' + item.name  + '/{x}/{y}/{z}', {
                    maxZoom: 18
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
