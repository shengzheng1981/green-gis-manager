import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {ConfigService} from './config.service';

@Injectable({
  providedIn: 'root'
})
export class FeatureService {

    public feature_url = this.configService.config.api.web_api + '/features';  // URL to web API
    public class_url = this.configService.config.api.web_api + '/featureClasses';  // URL to web API

    constructor(private http: HttpClient, private configService: ConfigService) {
    }

    getAll(): Observable<any> {
        return this.http.get(this.class_url + '/all');
    }

    publish(name: string, formData: any): Observable<any> {
        return this.http.post(this.class_url + '/publish/shapefile/' + name , formData);
    }

    delete(name: string): Observable<any> {
        return this.http.get(this.class_url + '/' + name + '/remove');
    }

    update(featureClass: any): Observable<any> {
        return this.http.post(this.class_url + '/' + featureClass.name + '/update', {class:  featureClass});
    }

    /*generate(name: string): Observable<any> {
        return this.http.get(this.url + '/generate/' + name);
    }

    testGenerate(name: string): Observable<any> {
        return this.http.get(this.url + '/test/generate/' + name);
    }*/
    getGeoJSON(name: string): Observable<any> {
        return this.http.get(this.feature_url + '/geojson/' + name);
    }


    getCategories(name: string, field: string): Observable<any> {
        return this.http.post(this.feature_url + '/category/' + name + '/' + field, {});
    }

    getClasses(name: string, field: string): Observable<any> {
        return this.http.post(this.feature_url + '/statistic/' + name + '/' + field, {});
    }

    search(name: string, condition: any): Observable<any> {
        return this.http.post(this.feature_url + '/' + name + '/query', {condition: condition} );
    }

    count(name: string, condition: any): Observable<any> {
        return this.http.post(this.feature_url + '/' + name + '/count', {condition: condition} );
    }

    /*updateProperty(name: string, feature: any){
        return this.http.post(this.url + '/' + name + '/property/update', {feature: feature} );
    }*/
}
