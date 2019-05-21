import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {ConfigService} from './config.service';

@Injectable({
  providedIn: 'root'
})
export class LabelService {

    public url = this.configService.config.api.web_api + '/labels';  // URL to web API


    constructor(private http: HttpClient, private configService: ConfigService) {
    }

    getAll(): Observable<any> {
        return this.http.get(this.url + '/');
    }

    getByMap(id: string): Observable<any> {
        return this.http.get(this.url + '/map/' + id);
    }

    create(label: any): Observable<any> {
        return this.http.post(this.url + "/create", { label : label });
    }

    delete(id: string): Observable<any> {
        return this.http.get(this.url + '/' + id + '/remove');
    }

    update(label: any): Observable<any> {
        return this.http.post(this.url + '/' + label._id + '/update', {label:  label});
    }

}
