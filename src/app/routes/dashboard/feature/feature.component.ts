import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FeatureService} from '../../../shared/services/feature.service';
import {default as swal} from "sweetalert2";
import {HttpClient, HttpEventType, HttpRequest} from '@angular/common/http';
import {ConfigService} from '../../../shared/services/config.service';
import {SymbolService} from '../../../shared/services/symbol.service';
import { map, tap, last } from 'rxjs/operators';

@Component({
    selector: 'app-feature',
    templateUrl: './feature.component.html',
    styleUrls: ['./feature.component.scss']
})
export class FeatureComponent implements OnInit {
    private ribbonCanvasRef:ElementRef;
    option = {
        field : {
            indeterminate: false,
            all_checked: false,
            enable_action : false
        },
        symbols : [],
        tile: {
            message: '',
            stats: []
        },
        symbol: {
            start_color: "#ff0000",
            end_color: "#00ff00",
            classes: 5
        },
        table: {
            result: []
        }
    };

    features: any = [];
    feature: any;

    @ViewChild('ribbonCanvas') set ribbonCanvas(elRef: ElementRef) {
        this.ribbonCanvasRef = elRef;
        this.ribbon();
    }
    constructor(private http: HttpClient, private featureService: FeatureService, private configService: ConfigService, private symbolService: SymbolService) {

    }

    ngOnInit() {
        this.init();
    }

    async init(){
        this.features = await this.featureService.getAll().toPromise();
        this.features.forEach( feature => {
            switch (feature.geomType)
            {
                case 1:
                    feature.geomTypeAlias = 'point';
                    break;
                case 2:
                    feature.geomTypeAlias = 'polyline';
                    break;
                case 3:
                    feature.geomTypeAlias = 'polygon';
                    break;
                case 4:
                    feature.geomTypeAlias = 'multipoint';
                    break;
                default:
                    feature.geomTypeAlias = 'other';
            }
        });
        this.feature = undefined;
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

    publish(fileInput: any) {
        const formData: any = new FormData();
        const files: Array<File> = <Array<File>>fileInput.target.files;
        console.log(files);
        let name = "";
        for(let i = 0; i < files.length; i++){
            let fileFullName = files[i]['name'];
            let index = fileFullName.lastIndexOf('.');
            let fileExt = fileFullName.substr(index+1);
            let fileName = fileFullName.substr( 0, index);
            formData.append("file", files[i], files[i]['name']);
            if (fileExt.toLowerCase() === 'shp') name = fileName;
        }
        this.http.post(this.configService.config.api.web_api + "/upload/shape", formData)
            .subscribe(res => {
                if (name != ""){
                    this.featureService.publish(name).subscribe( async (res) => {
                        if (res.result){
                            swal({
                                title: 'information',
                                text: 'publish success!',
                                type: 'success',
                                confirmButtonText: 'OK'
                            });
                            await this.init();
                            this.active(this.features.find( item => item.name === name ));
                        } else {
                            swal({
                                title: 'warning',
                                text: 'name exist!',
                                type: 'warning',
                                confirmButtonText: 'OK'
                            });
                        }
                    });
                }
            });
    }

    delete(){
        if (!this.feature) return;
        swal({
            title: 'warning',
            text: "confirm delete feature class " + this.feature.name + " ?",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel'
        }).then(result => {
            if (result.value) {
                this.featureService.delete(this.feature.name).subscribe( res => {
                    if (res.result){
                        swal({
                            title: 'information',
                            text: 'delete success!',
                            type: 'success',
                            confirmButtonText: 'OK'
                        });
                        this.init();
                    } else {
                        swal({
                            title: 'warning',
                            text: 'delete fail!',
                            type: 'warning',
                            confirmButtonText: 'OK'
                        });
                    }
                });
            }
        });
    }

    update(){
        if (!this.feature) return;
        swal({
            title: 'warning',
            text: "confirm update feature class " + this.feature.name + " ?",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel'
        }).then(result => {
            if (result.value) {
                this.featureService.update(this.feature).subscribe( res => {
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
        this.feature = item;
        this.feature.label = this.feature.label || { field: {}, position: {}, offset: {}, font: {}, zoom:{}, background:{}, border:{} };
        this.feature.label.field =    this.feature.label.field || {};
        this.feature.renderer = this.feature.renderer || { renderType: 0, simple: {} };
        this.feature.renderer.simple = this.feature.renderer.simple || {};
        this.feature.renderer.category = this.feature.renderer.category || {};
        this.feature.renderer.category.field =    this.feature.renderer.category.field || {};
        this.feature.renderer.category.categories = this.feature.renderer.category.categories || [];
        this.feature.renderer.class = this.feature.renderer.class || {};
        this.feature.renderer.class.field =    this.feature.renderer.class.field || {};
        this.feature.renderer.class.breaks = this.feature.renderer.class.breaks || [];
        this.feature.properties.forEach( item => {
            item.alias_2 = item.alias;
        });
        this.feature.renderer.category.field_2 = Object.assign({}, this.feature.renderer.category.field);
        this.feature.renderer.category.categories.forEach( item => {
            item.label_2 = item.label;
            item.style_2 = Object.assign({}, item.style);
        });
        this.feature.renderer.class.field_2 = Object.assign({}, this.feature.renderer.class.field);
        this.feature.renderer.class.breaks.forEach( item => {
            item.label_2 = item.label;
            item.min_2 = item.min;
            item.max_2 = item.max;
            item.style_2 = Object.assign({}, item.style);
        });
        this.option.symbols = await this.symbolService.getByGeomType(this.feature.geomType).toPromise();
        this.featureService.testGenerate(this.feature.name).subscribe( res => {
            if (res.result) {
                this.option.tile.stats = res.stats.filter( item => item._id > 0).sort( (a, b) =>  a._id - b._id );
            }
        });
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

    deleteField(field) {
        swal({
            title: 'warning',
            text: "confirm delete feature class " + this.feature.name + " ?",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel'
        }).then(result => {
            if (result.value) {
                const index = this.feature.properties.findIndex( item => item.name === field.name );
                this.feature.properties.splice(index, 1);
            }
        });
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
        if (!this.feature) return;
        if (!this.feature.renderer.category.field_2) return;
        swal({
            title: 'warning',
            text: "create categories renderer for feature class " + this.feature.name + " ?",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel'
        }).then(result => {
            if (result.value) {
                this.featureService.getCategories(this.feature.name, this.feature.renderer.category.field_2.name).subscribe( res => {
                    if (res.result) {
                        const start = this.getRGB(this.option.symbol.start_color);
                        const end = this.getRGB(this.option.symbol.end_color);
                        if (res.array.length == 0) {
                            swal({
                                title: 'warning',
                                text: 'field has no value!',
                                type: 'warning',
                                confirmButtonText: 'OK'
                            });
                            return;
                        } else if (res.array.length > 100){
                            swal({
                                title: 'warning',
                                text: 'field has too many categories(more than 100)!',
                                type: 'warning',
                                confirmButtonText: 'OK'
                            });
                            return;
                        }
                        this.feature.renderer.category.field = Object.assign({}, this.feature.renderer.category.field_2);
                        const red = res.array.length > 1 ? Array.from({length: res.array.length}, (v, i) => Math.round(start[0] + (end[0] - start[0]) / (res.array.length - 1) * i) ) : [start[0]];
                        const green = res.array.length > 1 ? Array.from({length: res.array.length}, (v, i) => Math.round(start[1] + (end[1] - start[1]) / (res.array.length - 1) * i) ) : [start[1]];
                        const blue = res.array.length > 1 ? Array.from({length: res.array.length}, (v, i) => Math.round(start[2] + (end[2] - start[2]) / (res.array.length - 1) * i) ) : [start[2]];
                        this.feature.renderer.category.categories = res.array.map( (item,i) => {
                            return {
                                auto: true,
                                label: item,
                                label_2: item,
                                value: item,
                                style: {
                                    radius: 6,
                                    fillColor: '#' + red[i].toString(16).padStart(2, "0") + green[i].toString(16).padStart(2, "0") + blue[i].toString(16).padStart(2, "0"),
                                    fillOpacity: 1,
                                    color: '#' + red[i].toString(16).padStart(2, "0") + green[i].toString(16).padStart(2, "0") + blue[i].toString(16).padStart(2, "0"),
                                    opacity: 1,
                                    weight: 2
                                },
                                style_2: {
                                    radius: 6,
                                    fillColor: '#' + red[i].toString(16).padStart(2, "0") + green[i].toString(16).padStart(2, "0") + blue[i].toString(16).padStart(2, "0"),
                                    fillOpacity: 1,
                                    color: '#' + red[i].toString(16).padStart(2, "0") + green[i].toString(16).padStart(2, "0") + blue[i].toString(16).padStart(2, "0"),
                                    opacity: 1,
                                    weight: 2
                                }
                            }
                        })
                    }
                })
            }
        });
    }

    createClasses(){
        if (!this.feature) return;
        if (!this.feature.renderer.class.field_2 || !this.option.symbol.classes) return;
        this.option.symbol.classes = this.option.symbol.classes <= 1 ? 2 : ( this.option.symbol.classes > 20 ? 20 : Math.round(this.option.symbol.classes) );
        swal({
            title: 'warning',
            text: "create classes renderer for feature class " + this.feature.name + " ?",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel'
        }).then(result => {
            if (result.value) {
                this.featureService.getClasses(this.feature.name, this.feature.renderer.class.field_2.name).subscribe( res => {
                    if (res.result) {
                        const start = this.getRGB(this.option.symbol.start_color);
                        const end = this.getRGB(this.option.symbol.end_color);
                        const min = res.stat[0].min, max = res.stat[0].max;
                        this.feature.renderer.class.field = Object.assign({}, this.feature.renderer.class.field_2);

                        const red = Array.from({length: this.option.symbol.classes}, (v, i) => Math.round(start[0] + (end[0] - start[0]) / (this.option.symbol.classes - 1) * i) );
                        const green = Array.from({length: this.option.symbol.classes}, (v, i) => Math.round(start[1] + (end[1] - start[1]) / (this.option.symbol.classes - 1) * i) );
                        const blue = Array.from({length: this.option.symbol.classes}, (v, i) => Math.round(start[2] + (end[2] - start[2]) / (this.option.symbol.classes - 1) * i) );
                        this.feature.renderer.class.breaks = Array.from({length: this.option.symbol.classes},(item,i) => {
                            return {
                                auto: true,
                                min: Math.round((min + (max - min) / (this.option.symbol.classes) * i) * 1000 ) / 1000,
                                max: Math.round((min + (max - min) / (this.option.symbol.classes) * (i + 1) ) * 1000 ) / 1000,
                                min_2: Math.round((min + (max - min) / (this.option.symbol.classes) * i) * 1000 ) / 1000,
                                max_2: Math.round((min + (max - min) / (this.option.symbol.classes) * (i + 1) ) * 1000 ) / 1000,
                                label: (min + (max - min) / (this.option.symbol.classes) * i).toFixed(3) + "-" + (min + (max - min) / (this.option.symbol.classes) * (i + 1)).toFixed(3),
                                label_2: (min + (max - min) / (this.option.symbol.classes) * i).toFixed(3) + "-" + (min + (max - min) / (this.option.symbol.classes) * (i + 1)).toFixed(3),
                                style: {
                                    radius: 6,
                                    fillColor: '#' + red[i].toString(16).padStart(2, "0") + green[i].toString(16).padStart(2, "0") + blue[i].toString(16).padStart(2, "0"),
                                    fillOpacity: 1,
                                    color: '#' + red[i].toString(16).padStart(2, "0") + green[i].toString(16).padStart(2, "0") + blue[i].toString(16).padStart(2, "0"),
                                    opacity: 1,
                                    weight: 2
                                },
                                style_2: {
                                    radius: 6,
                                    fillColor: '#' + red[i].toString(16).padStart(2, "0") + green[i].toString(16).padStart(2, "0") + blue[i].toString(16).padStart(2, "0"),
                                    fillOpacity: 1,
                                    color: '#' + red[i].toString(16).padStart(2, "0") + green[i].toString(16).padStart(2, "0") + blue[i].toString(16).padStart(2, "0"),
                                    opacity: 1,
                                    weight: 2
                                }
                            }
                        })
                    }
                })
            }
        });
    }

    //tile
    generateTile(){
        if (!this.feature) return;
        swal({
            title: 'warning',
            text: "create static tile for feature class " + this.feature.name + " ?",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel'
        }).then(result => {
            if (result.value) {
                /*const req = new HttpRequest('GET', this.configService.config.api.web_api + "/features/generate/" + this.feature.name,  {
                    reportProgress: true
                });
                this.http.request(req).pipe(
                    tap(event => {
                        console.log(event);
                        this.option.tile.message = this.option.tile.message + "\n";
                    }),last()
                ) .subscribe((res:any) => {
                    if (res.body.result) {
                        this.feature.image = true;
                    }
                });*/
                this.featureService.generate(this.feature.name).subscribe(res => {
                   if (res.result) {
                       this.feature.image = true;
                       swal({
                           title: 'information',
                           text: 'create tile success!',
                           type: 'success',
                           confirmButtonText: 'OK'
                       });
                   }
                });
            }
        });
    }

    //table
    startRecordEdit(item) {
        item.edit = true;
    }

    cancelRecordEdit(item) {
        item.edit = false;
        item.properties_2 = Object.assign({}, item.properties);
    }

    saveRecordEdit(item) {
        item.properties = Object.assign({}, item.properties_2);
        item.edit = false;
        this.featureService.updateProperty(this.feature.name, item).subscribe();
    }

    search() {
        if (!this.feature) return;
        this.featureService.count(this.feature.name, {}).subscribe( res => {
            if (res.result) {
                const search = () => {
                    this.featureService.search(this.feature.name, {}).subscribe( res => {
                        if (res.result) {
                            this.option.table.result = res.features;
                            this.option.table.result.forEach( item => {
                                item.properties_2 = Object.assign({}, item.properties);
                            });
                        }
                    });
                };
                if (res.count > 1000){
                    swal({
                        title: 'warning',
                        text: "result count > 1000, continue?",
                        type: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Confirm',
                        cancelButtonText: 'Cancel'
                    }).then(result => {
                        if (result.value) {
                            search();
                        }
                    });
                }else {
                    search();
                }
            }
        }, err => {
            swal({
                title: 'warning',
                text: 'wrong search condition!',
                type: 'warning',
                confirmButtonText: 'OK'
            });
        });
    }


    compareObject(o1: any, o2: any): boolean {
        return o1 && o2 ? o1._id === o2._id : o1 === o2;
    }

    compareField(o1: any, o2: any): boolean {
        return o1 && o2 ? o1.name === o2.name : o1 === o2;
    }
}
