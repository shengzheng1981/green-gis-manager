import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {ConfigService} from './config.service';

@Injectable({
  providedIn: 'root'
})
export class FeatureService {

    public url = this.configService.config.api.web_api + '/features';  // URL to web API


    constructor(private http: HttpClient, private configService: ConfigService) {
    }

    getAll(): Observable<any> {
        return this.http.get(this.url + '/all');
    }

    publish(name: string): Observable<any> {
        return this.http.post(this.url + '/publish/shapefile', {name: name});
    }

    delete(name: string): Observable<any> {
        return this.http.get(this.url + '/' + name + '/remove');
    }

    update(feature: any): Observable<any> {
        return this.http.post(this.url + '/' + feature.name + '/update', {feature:  feature});
    }

}
