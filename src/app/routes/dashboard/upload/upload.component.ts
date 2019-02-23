import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {default as swal} from "sweetalert2";

@Component({
    selector: 'app-example-upload',
    templateUrl: './upload.component.html',
    styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {

    upload_url = 'http://localhost:4000/upload';
    publish_url = 'http://localhost:4000/features/publish';

    constructor(private http:HttpClient) {
    }

    ngOnInit() {
    }

    upload(fileInput: any) {
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
        this.http.post(this.upload_url, formData)
            .subscribe(res => {
                if (name != ""){
                    this.http.get(this.publish_url + "/shapefile/" + name).subscribe( res => {
                        swal({
                            title: '提醒',
                            text: '发布成功！',
                            type: 'success',
                            confirmButtonText: '确认'
                        });
                    });
                }
            });
    }

}
