import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {ConfigService} from './config.service';

@Injectable({
  providedIn: 'root'
})
export class LayerService {

    public url = this.configService.config.api.web_api + '/layers';  // URL to web API


    constructor(private http: HttpClient, private configService: ConfigService) {
    }

    getAll(): Observable<any> {
        return this.http.get(this.url + '/');
    }

    create(layer: any): Observable<any> {
        return this.http.post(this.url + "/create", { layer : layer });
    }

    delete(id: string): Observable<any> {
        return this.http.post(this.url + '/' + id + '/remove', {});
    }

    update(layer: any): Observable<any> {
        return this.http.post(this.url + '/' + layer._id + '/update', { layer:  layer });
    }

}
