import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FeatureService} from '../../../shared/services/feature.service';
import {HttpClient} from '@angular/common/http';
import {ConfigService} from '../../../shared/services/config.service';
import {
    Feature,
    FeatureClass,
    FeatureLayer,
    Point,
    Polygon,
    Polyline, SimpleFillSymbol,
    SimpleLineSymbol,
    SimpleMarkerSymbol,
    SimplePointSymbol
} from 'green-gis';
import {LayerService} from '../../../shared/services/layer.service';

@Component({
  selector: 'app-backend',
  templateUrl: './backend.component.html',
  styleUrls: ['./backend.component.css']
})
export class BackendComponent implements OnInit {

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
            this.layers.forEach(layer => layer.checked = false);
            layer.checked = true;
            this.map.setTileUrl(this.configService.config.api.web_api  +  "/tiles/image/" + layer._id + "/{x}/{y}/{z}");
            this.map.redraw();
        }
    }

}
