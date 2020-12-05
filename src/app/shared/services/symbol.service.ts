import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {ConfigService} from './config.service';

@Injectable({
  providedIn: 'root'
})
export class SymbolService {

    public url = this.configService.config.api.web_api + '/symbols';  // URL to web API


    constructor(private http: HttpClient, private configService: ConfigService) {
    }

    getAll(): Observable<any> {
        return this.http.get(this.url + '/');
    }

    getByType(type: number): Observable<any> {
        return this.http.get(this.url + '/type/' + type);
    }

    /*getByGeomType(geotype: number): Observable<any> {
        return this.http.get(this.url + '/geomtype/' + geotype);
    }*/

    create(symbol: any): Observable<any> {
        return this.http.post(this.url + "/create", { symbol : symbol });
    }

    delete(id: string): Observable<any> {
        return this.http.post(this.url + '/' + id + '/remove', {});
    }

    update(symbol: any): Observable<any> {
        return this.http.post(this.url + '/' + symbol._id + '/update', {symbol:  symbol});
    }

}
