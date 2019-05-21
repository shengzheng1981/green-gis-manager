import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {ConfigService} from './config.service';

@Injectable({
  providedIn: 'root'
})
export class MapService {

    public url = this.configService.config.api.web_api + '/maps';  // URL to web API


    constructor(private http: HttpClient, private configService: ConfigService) {
    }

    getAll(): Observable<any> {
        return this.http.get(this.url + '/');
    }

    create(map: any): Observable<any> {
        return this.http.post(this.url + "/create", { map : map });
    }

    delete(id: string): Observable<any> {
        return this.http.get(this.url + '/' + id + '/remove');
    }

    update(map: any): Observable<any> {
        return this.http.post(this.url + '/' + map._id + '/update', {map:  map});
    }

}
