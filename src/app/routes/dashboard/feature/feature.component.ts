import {Component, OnInit} from '@angular/core';
import {FeatureService} from '../../../shared/services/feature.service';
import {default as swal} from "sweetalert2";
import {HttpClient} from '@angular/common/http';
import {ConfigService} from '../../../shared/services/config.service';

@Component({
    selector: 'app-feature',
    templateUrl: './feature.component.html',
    styleUrls: ['./feature.component.css']
})
export class FeatureComponent implements OnInit {
    upload_url = 'http://localhost:4000/upload';
    publish_url = 'http://localhost:4000/features/publish';
    features = [];

    constructor(private http: HttpClient, private featureService: FeatureService, private configService: ConfigService) {
    }

    ngOnInit() {
        this.init();
    }

    init(){
        this.featureService.getAll().subscribe( res => this.features = res);
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
        this.http.post(this.configService.config.api.web_api + "/upload", formData)
            .subscribe(res => {
                if (name != ""){
                    this.featureService.publish(name).subscribe( res => {
                        if (res.result){
                            swal({
                                title: 'information',
                                text: 'publish success!',
                                type: 'success',
                                confirmButtonText: 'OK'
                            });
                            this.init();
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

    delete(feature){
        swal({
            title: 'warning',
            text: "confirm delete feature class " + feature.name + " ?",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel'
        }).then(result => {
            if (result.value) {
                this.featureService.delete(feature.name).subscribe( res => {
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

}
