import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})
export class ConfigService {

    public config : any;
    //public upload_url : string;

    constructor(private http: HttpClient) {
    }

    load(url) : any {
        return new Promise((resolve) => {
            this.http.get((url || "assets/json/config.json") + '?v=' + (new Date()).getTime())
                .subscribe((data :any) => {
                    this.config = data;
                    //this.upload_url = this.config.api.web_api + '/upload/shape';
                    resolve();
                });
        });
    }
}
