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
        tile: {
            message: '',
            stats: []
        },
        table: {
            result: []
        }
    };

    features: any = [];
    feature: any;


    constructor(private http: HttpClient, private featureService: FeatureService, private configService: ConfigService, private symbolService: SymbolService) {

    }

    ngOnInit() {
        this.init();
    }

    async init(){
        this.features = await this.featureService.getAll().toPromise();
        this.features.forEach( feature => {
            switch (feature.geotype)
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
        this.features[0] && this.active(this.features[0]);
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
        if (name != ""){
            this.featureService.publish(name, formData).subscribe( async (res) => {
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
        this.feature.fields.forEach( item => {
            item.alias_2 = item.alias;
        });
        this.option = {
            field : {
                indeterminate: false,
                all_checked: false,
                enable_action : false
            },
            tile: {
                message: '',
                stats: []
            },
            table: {
                result: []
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
                const index = this.feature.fields.findIndex( item => item.name === field.name );
                this.feature.fields.splice(index, 1);
            }
        });
    }

    //tile
    /*generateTile(){
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
    }*/

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
        //this.featureService.updateProperty(this.feature.name, item).subscribe();
    }

    search() {
        if (!this.feature) return;
        this.featureService.count(this.feature.name, {}).subscribe( count => {
            const search = () => {
                this.featureService.search(this.feature.name, {}, "*").subscribe( array => {
                    this.option.table.result = array;
                    this.option.table.result.forEach( item => {
                        item.properties_2 = Object.assign({}, item.properties);
                    });
                });
            };
            if (count > 1000){
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
