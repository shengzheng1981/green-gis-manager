import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ConfigService} from '../../../shared/services/config.service';
import {Canvas, LayerGroup, Map, TileLayer} from 'leaflet';
import {HttpClient} from '@angular/common/http';
import {FeatureService} from '../../../shared/services/feature.service';

@Component({
  selector: 'app-static',
  templateUrl: './static.component.html',
  styleUrls: ['./static.component.css']
})
export class StaticComponent implements OnInit {

    features = [];
    map : any;

    @ViewChild('map') mapDiv: ElementRef;

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
                item.layer = new TileLayer(this.configService.config.api.web_api + "/tiles/static/" + item.name + "/{x}/{y}/{z}" , {
                //item.layer = new TileLayer(this.configService.config.api.web_api + "/statictiles/" + item.name + "/{z}/{x}/{y}.png" , {
                    maxZoom: 18,
                    errorTileUrl: this.configService.config.api.web_api + "/images/empty.png"
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
