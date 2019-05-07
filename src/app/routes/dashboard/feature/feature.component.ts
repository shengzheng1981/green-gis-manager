import {Component, OnInit} from '@angular/core';
import {FeatureService} from '../../../shared/services/feature.service';
import {default as swal} from "sweetalert2";
import {HttpClient} from '@angular/common/http';
import {ConfigService} from '../../../shared/services/config.service';
import {SymbolService} from '../../../shared/services/symbol.service';

@Component({
    selector: 'app-feature',
    templateUrl: './feature.component.html',
    styleUrls: ['./feature.component.scss']
})
export class FeatureComponent implements OnInit {

    option = {
        field : {
            indeterminate: false,
            all_checked: false,
            enable_action : false
        },
        symbols : []
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
        this.feature = undefined;
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
                            this.feature = this.features.find( item => item.name === name );
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
        this.feature.renderer = this.feature.renderer || { renderType: 0, simple: {} };
        this.feature.renderer.simple = this.feature.renderer.simple || {};
        this.feature.properties.forEach( item => {
            item.alias_2 = item.alias;
        });
        this.option.symbols = await this.symbolService.getByGeomType(this.feature.geomType).toPromise();
    }


    /*refreshFieldStatus(): void {
        if (!this.feature) return;
        const allChecked = this.feature.properties.every(value => value.checked === true);
        const allUnChecked = this.feature.properties.every(value => !value.checked);
        this.option.field.all_checked = allChecked;
        this.option.field.indeterminate = (!allChecked) && (!allUnChecked);
        this.option.field.enable_action = this.feature.properties.some(value => value.checked);
    }

    checkAllFields(value: boolean): void {
        this.feature.properties.forEach(data => data.checked = value);
        this.refreshFieldStatus();
    }*/

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

    compareObject(o1: any, o2: any): boolean {
        return o1 && o2 ? o1._id === o2._id : o1 === o2;
    }

}
