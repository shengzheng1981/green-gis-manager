import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {default as swal} from "sweetalert2";
import {HttpClient, HttpEventType, HttpRequest} from '@angular/common/http';
import {ConfigService} from '../../../shared/services/config.service';
import {SymbolService} from '../../../shared/services/symbol.service';
import { map, tap, last } from 'rxjs/operators';
import {LayerService} from '../../../shared/services/layer.service';
import {FeatureService} from '../../../shared/services/feature.service';

@Component({
    selector: 'app-layer',
    templateUrl: './layer.component.html',
    styleUrls: ['./layer.component.scss']
})
export class LayerComponent implements OnInit {
    private ribbonCanvasRef:ElementRef;
    option = {
        symbols : [],
        symbol: {
            start_color: "#ff0000",
            end_color: "#00ff00",
            classes: 5
        }
    };

    classes: any = [];
    layers: any = [];
    layer: any;

    @ViewChild('ribbonCanvas') set ribbonCanvas(elRef: ElementRef) {
        this.ribbonCanvasRef = elRef;
        this.ribbon();
    }
    constructor(private http: HttpClient, private featureService: FeatureService, private layerService: LayerService, public configService: ConfigService, private symbolService: SymbolService) {

    }

    ngOnInit() {
        this.init();
    }

    async init(){
        this.classes = await this.featureService.getAll().toPromise();
        this.layers = await this.layerService.getAll().toPromise();
        this.layers[0] && this.active(this.layers[0]);
    }

    ribbon() {
        if (!this.ribbonCanvasRef) return;
        const canvas = this.ribbonCanvasRef.nativeElement;
        const ctx = canvas.getContext("2d");
        const gradient = ctx.createLinearGradient(0,0,canvas.width,0);
        gradient.addColorStop(0, this.option.symbol.start_color);
        gradient.addColorStop(1, this.option.symbol.end_color);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    create(layer) {
        this.layers.push(layer);
        this.layers = [...this.layers];
        this.active(layer);
    }

    delete(){
        if (!this.layer) return;
        swal({
            title: 'warning',
            text: "confirm delete layer " + this.layer.name + " ?",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel'
        }).then(result => {
            if (result.value) {
                this.layerService.delete(this.layer._id).subscribe( res => {
                    const index = this.layers.findIndex( item => item._id === this.layer._id );
                    this.layers.splice(index, 1);
                    this.layers = [...this.layers];
                    swal({
                        title: 'information',
                        text: 'delete success!',
                        type: 'success',
                        confirmButtonText: 'OK'
                    });
                });
            }
        });
    }

    update(){
        if (!this.layer) return;
        swal({
            title: 'warning',
            text: "confirm update layer " + this.layer.name + " ?",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel'
        }).then(result => {
            if (result.value) {
                this.layerService.update(this.layer).subscribe( res => {
                    if (res.result){
                        swal({
                            title: 'information',
                            text: 'update success!',
                            type: 'success',
                            confirmButtonText: 'OK'
                        });
                    } else {
                        swal({
                            title: 'warning',
                            text: 'update fail!',
                            type: 'warning',
                            confirmButtonText: 'OK'
                        });
                    }
                });
            }
        });
    }

    async active(item) {
        this.layer = item;
        this.layer.label = this.layer.label || { field: {}, position: {}, offset: {}, font: {}, zoom:{}, background:{}, border:{} };
        this.layer.label.field =    this.layer.label.field || {};
        this.layer.renderer = this.layer.renderer || { method: 0, simple: {} };
        this.layer.renderer.simple = this.layer.renderer.simple || {};
        this.layer.renderer.simple.symbol = this.layer.renderer.simple.symbol || {};
        this.layer.renderer.simple.symbol.style = this.layer.renderer.simple.symbol.style || {};
        this.layer.renderer.category = this.layer.renderer.category || {};
        this.layer.renderer.category.field = this.layer.renderer.category.field || {};
        this.layer.renderer.category.categories = this.layer.renderer.category.categories || [];
        this.layer.renderer.class = this.layer.renderer.class || {};
        this.layer.renderer.class.field =  this.layer.renderer.class.field || {};
        this.layer.renderer.class.breaks = this.layer.renderer.class.breaks || [];
        this.layer.renderer.category.field_2 = Object.assign({}, this.layer.renderer.category.field);
        this.layer.renderer.category.categories.forEach( item => {
            item.symbol = item.symbol || {};
            item.symbol.style = item.symbol.style || {};
            item.label_2 = item.label;
            item.symbol_2 = Object.assign({}, item.symbol);
        });
        this.layer.renderer.class.field_2 = Object.assign({}, this.layer.renderer.class.field);
        this.layer.renderer.class.breaks.forEach( item => {
            item.symbol = item.symbol || {};
            item.symbol.style = item.symbol.style || {};
            item.label_2 = item.label;
            item.min_2 = item.min;
            item.max_2 = item.max;
            item.symbol_2 = Object.assign({}, item.symbol);
        });
        this.option = {
            symbols : [],
            symbol: {
                start_color: "#ff0000",
                end_color: "#00ff00",
                classes: 5
            }
        };
        // this.option.symbols = await this.symbolService.getByGeomType(this.feature.geotype).toPromise();
        /*this.featureService.testGenerate(this.feature.name).subscribe( res => {
            if (res.result) {
                this.option.tile.stats = res.stats.filter( item => item._id > 0).sort( (a, b) =>  a._id - b._id );
            }
        });*/
    }

    //field
    startFieldEdit(item) {
        item.edit = true;
    }

    cancelFieldEdit(item) {
        item.edit = false;
        item.alias_2 = item.alias;
    }

    saveFieldEdit(item) {
        item.alias = item.alias_2;
        item.edit = false;
    }

    //symbol
    startSymbolEdit(item) {
        item.edit = true;
    }

    cancelSymbolEdit(item) {
        item.edit = false;
        item.label_2 = item.label;
        item.min_2 = item.min;
        item.max_2 = item.max;
        item.style_2 = Object.assign({}, item.style);
    }

    saveSymbolEdit(item) {
        item.label = item.label_2;
        item.min = item.min_2;
        item.max = item.max_2;
        item.style = Object.assign({}, item.style_2);
        item.edit = false;
    }

    getRGB( color ) {
        color = color || '#ff0000';
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
            return sColorChange;
        }
        return [255,0,0];
    };

    createCategories(){
        if (!this.layer) return;
        if (!this.layer.renderer.category.field_2) return;
        swal({
            title: 'warning',
            text: "create categories renderer for layer " + this.layer.name + " ?",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel'
        }).then(result => {
            if (result.value) {
                this.featureService.getCategories(this.layer.class.name, this.layer.renderer.category.field_2.name).subscribe( array => {
                    const start = this.getRGB(this.option.symbol.start_color);
                    const end = this.getRGB(this.option.symbol.end_color);
                    if (!Array.isArray(array) || array.length == 0) {
                        swal({
                            title: 'warning',
                            text: 'field has no value!',
                            type: 'warning',
                            confirmButtonText: 'OK'
                        });
                        return;
                    } else if (array.length > 100){
                        swal({
                            title: 'warning',
                            text: 'field has too many categories(more than 100)!',
                            type: 'warning',
                            confirmButtonText: 'OK'
                        });
                        return;
                    }
                    this.layer.renderer.category.field = Object.assign({}, this.layer.renderer.category.field_2);
                    const red = array.length > 1 ? Array.from({length: array.length}, (v, i) => Math.round(start[0] + (end[0] - start[0]) / (array.length - 1) * i) ) : [start[0]];
                    const green = array.length > 1 ? Array.from({length: array.length}, (v, i) => Math.round(start[1] + (end[1] - start[1]) / (array.length - 1) * i) ) : [start[1]];
                    const blue = array.length > 1 ? Array.from({length: array.length}, (v, i) => Math.round(start[2] + (end[2] - start[2]) / (array.length - 1) * i) ) : [start[2]];
                    this.layer.renderer.category.categories = array.map( (item,i) => {
                        return {
                            auto: true,
                            label: item,
                            label_2: item,
                            value: item,
                            symbol: {
                                style: {
                                    radius: 6,
                                    fillColor: '#' + red[i].toString(16).padStart(2, "0") + green[i].toString(16).padStart(2, "0") + blue[i].toString(16).padStart(2, "0"),
                                    fillOpacity: 1,
                                    strokeColor: '#' + red[i].toString(16).padStart(2, "0") + green[i].toString(16).padStart(2, "0") + blue[i].toString(16).padStart(2, "0"),
                                    strokeOpacity: 1,
                                    lineWidth: 2
                                }
                            },
                            symbol_2: {
                                style: {
                                    radius: 6,
                                    fillColor: '#' + red[i].toString(16).padStart(2, "0") + green[i].toString(16).padStart(2, "0") + blue[i].toString(16).padStart(2, "0"),
                                    fillOpacity: 1,
                                    strokeColor: '#' + red[i].toString(16).padStart(2, "0") + green[i].toString(16).padStart(2, "0") + blue[i].toString(16).padStart(2, "0"),
                                    strokeOpacity: 1,
                                    lineWidth: 2
                                }
                            }
                        }
                    });
                })
            }
        });
    }

    createClasses(){
        if (!this.layer) return;
        if (!this.layer.renderer.class.field_2 || !this.option.symbol.classes) return;
        this.option.symbol.classes = this.option.symbol.classes <= 1 ? 2 : ( this.option.symbol.classes > 20 ? 20 : Math.round(this.option.symbol.classes) );
        swal({
            title: 'warning',
            text: "create classes renderer for layer " + this.layer.name + " ?",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel'
        }).then(result => {
            if (result.value) {
                this.featureService.getClasses(this.layer.class.name, this.layer.renderer.class.field_2.name).subscribe( stat => {
                    const start = this.getRGB(this.option.symbol.start_color);
                    const end = this.getRGB(this.option.symbol.end_color);
                    const min = stat[0].min, max = stat[0].max;
                    this.layer.renderer.class.field = Object.assign({}, this.layer.renderer.class.field_2);

                    const red = Array.from({length: this.option.symbol.classes}, (v, i) => Math.round(start[0] + (end[0] - start[0]) / (this.option.symbol.classes - 1) * i) );
                    const green = Array.from({length: this.option.symbol.classes}, (v, i) => Math.round(start[1] + (end[1] - start[1]) / (this.option.symbol.classes - 1) * i) );
                    const blue = Array.from({length: this.option.symbol.classes}, (v, i) => Math.round(start[2] + (end[2] - start[2]) / (this.option.symbol.classes - 1) * i) );
                    this.layer.renderer.class.breaks = Array.from({length: this.option.symbol.classes},(item,i) => {
                        return {
                            auto: true,
                            min: Math.round((min + (max - min) / (this.option.symbol.classes) * i) * 1000 ) / 1000,
                            max: Math.round((min + (max - min) / (this.option.symbol.classes) * (i + 1) ) * 1000 ) / 1000,
                            min_2: Math.round((min + (max - min) / (this.option.symbol.classes) * i) * 1000 ) / 1000,
                            max_2: Math.round((min + (max - min) / (this.option.symbol.classes) * (i + 1) ) * 1000 ) / 1000,
                            label: (min + (max - min) / (this.option.symbol.classes) * i).toFixed(3) + "-" + (min + (max - min) / (this.option.symbol.classes) * (i + 1)).toFixed(3),
                            label_2: (min + (max - min) / (this.option.symbol.classes) * i).toFixed(3) + "-" + (min + (max - min) / (this.option.symbol.classes) * (i + 1)).toFixed(3),
                            symbol: {
                                style: {
                                    radius: 6,
                                    fillColor: '#' + red[i].toString(16).padStart(2, "0") + green[i].toString(16).padStart(2, "0") + blue[i].toString(16).padStart(2, "0"),
                                    fillOpacity: 1,
                                    strokeColor: '#' + red[i].toString(16).padStart(2, "0") + green[i].toString(16).padStart(2, "0") + blue[i].toString(16).padStart(2, "0"),
                                    strokeOpacity: 1,
                                    lineWidth: 2
                                }
                            },
                            symbol_2: {
                                style: {
                                    radius: 6,
                                    fillColor: '#' + red[i].toString(16).padStart(2, "0") + green[i].toString(16).padStart(2, "0") + blue[i].toString(16).padStart(2, "0"),
                                    fillOpacity: 1,
                                    strokeColor: '#' + red[i].toString(16).padStart(2, "0") + green[i].toString(16).padStart(2, "0") + blue[i].toString(16).padStart(2, "0"),
                                    strokeOpacity: 1,
                                    lineWidth: 2
                                }
                            }
                        }
                    });
                })
            }
        });
    }

    upload(fileInput: any, symbol: any){
        const formData: any = new FormData();
        const files: Array<File> = <Array<File>>fileInput.target.files;
        if (files.length == 0) return;
        formData.append("file", files[0], files[0]['name']);
        let name = files[0]['name'];
        this.http.post(this.configService.config.api.web_api + "/upload/image", formData)
            .subscribe(res => {
                symbol.style.icon = name;
            });
    }

    compareObject(o1: any, o2: any): boolean {
        return o1 && o2 ? o1._id === o2._id : o1 === o2;
    }

    compareField(o1: any, o2: any): boolean {
        return o1 && o2 ? o1.name === o2.name : o1 === o2;
    }
}
