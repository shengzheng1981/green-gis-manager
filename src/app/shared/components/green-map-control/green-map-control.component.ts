import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import {Map} from 'green-gis';
import {ConfigService} from "../../services/config.service";

declare var AMap: any;

@Component({
  selector: 'green-map-control',
  templateUrl: './green-map-control.component.html',
  styleUrls: ['./green-map-control.component.scss']
})
export class GreenMapControl implements OnInit, OnDestroy {

    @ViewChild('aMapDiv', {static:true}) aMapDiv: ElementRef;
    @ViewChild('gMapDiv', {static:true}) gMapDiv: ElementRef;
    @Input() option;
    @Output() mapInit = new EventEmitter<any>();
    map: Map;
    amap: any;

    constructor(private elRef: ElementRef, private configService: ConfigService) {

    }

    ngOnInit() {
        this.option = this.option || {};
        this.option.logo = this.option.hasOwnProperty('logo') ? this.option.logo : false;
        this.option.slider = this.option.hasOwnProperty('slider') ? this.option.slider : true;
        this.option.showLabels = this.option.hasOwnProperty('showLabels') ? this.option.showLabels : true;
        this.option.isScrollWheelZoom = this.option.hasOwnProperty('isScrollWheelZoom') ? this.option.isScrollWheelZoom : true;
        this.option.showLoading = this.option.hasOwnProperty('showLoading') ? this.option.showLoading : true;
        this.option.showImageMap = this.option.hasOwnProperty('showImageMap') ? this.option.showImageMap : false;
        this.option.showSatellite = this.option.hasOwnProperty('showSatellite') ? this.option.showSatellite : false;
        this.option.maxZoom = 20;
        this.option.minZoom = this.option.hasOwnProperty('minZoom') ? this.option.minZoom : 5;
        this.option.mapStyle = this.option.hasOwnProperty('mapStyle') ? this.option.mapStyle : "amap://styles/1e65d329854a3cf61b568b7a4e2267fd";

        this.amap = new AMap.Map(this.aMapDiv.nativeElement, {
            zoom: this.configService.config.map.zoom,
            center: [this.configService.config.map.center.lon, this.configService.config.map.center.lat],
            fadeOnZoom: false,
            navigationMode: 'classic',
            optimizePanAnimation: false,
            animateEnable: false,
            dragEnable: false,
            zoomEnable: false,
            resizeEnable: true,
            doubleClickZoom: false,
            keyboardEnable: false,
            scrollWheel: false,
            expandZoomRange: true,
            zooms: [3, 20],
            mapStyle: this.option.mapStyle || 'normal',
            features: this.option.features || ['road', 'point', 'bg'],
            viewMode: this.option.viewMode || '2D'
        });

        // 同时引入工具条插件，比例尺插件和鹰眼插件
        AMap.plugin([
            'AMap.Scale',
        ], () => {
            // 在图面添加比例尺控件，展示地图在当前层级和纬度下的比例尺
            this.amap.addControl(new AMap.Scale());
        });

        const satellite = new AMap.TileLayer.Satellite();
        satellite.setMap(this.amap);

        if (!this.option.showSatellite) {
            satellite.hide();
            this.amap.setFeatures(this.option.features || ['road', 'point', 'bg']);
        }


        this.map = new Map(this.gMapDiv.nativeElement);

        this.map.on("extent", (event) => {
            this.amap.setZoomAndCenter(event.zoom, event.center);
        });

        this.map.setView([this.configService.config.map.center.lon, this.configService.config.map.center.lat], this.configService.config.map.zoom);
        this.mapInit.emit({
            map: this.map,
            amap: this.amap
        });
    }

    ngOnDestroy() {
        this.map && this.map.destroy();
        this.amap && this.amap.destroy();
    }
}
