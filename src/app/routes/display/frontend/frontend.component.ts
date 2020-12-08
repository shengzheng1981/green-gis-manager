import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FeatureService} from '../../../shared/services/feature.service';
import {HttpClient} from '@angular/common/http';
import {ConfigService} from '../../../shared/services/config.service';
import {LayerService} from '../../../shared/services/layer.service';

@Component({
  selector: 'app-frontend',
  templateUrl: './frontend.component.html',
  styleUrls: ['./frontend.component.css']
})
export class FrontendComponent implements OnInit {

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
                //this._drawLayer(layer);
            }
        } else {
            if (layer.view) {
                layer.view.visible = false;
                this.map.redraw();
            }
        }
    }
}