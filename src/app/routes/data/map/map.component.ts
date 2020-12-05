import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {MapService} from '../../../shared/services/map.service';
import {LabelService} from '../../../shared/services/label.service';
import {default as swal} from "sweetalert2";
import {ConfigService} from '../../../shared/services/config.service';

@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
    private mapDivRef: ElementRef;
    maps: any = [];
    map: any;
    label: any;
    renderer: any;
    lmap: any;
    option : any = {
        label: {
            mode: 0          //0 for none 1 for create 2 for select
        }
    };

    @ViewChild('mapDiv') set mapDiv(elRef: ElementRef) {
        this.mapDivRef = elRef;
        //this.initMap();
    }

    constructor(private mapService: MapService, private labelService:LabelService, private configService: ConfigService) {

    }

    ngOnInit() {
        this.init();
    }

    async init(){
        this.maps = await this.mapService.getAll().toPromise();
        this.map = undefined;
    }

    async active(item) {
        this.map = item;
    }

    create(){
        this.mapService.create({}).subscribe( res => {
            if (res.result){
                this.maps.push(res.doc);
                this.active(res.doc);
            } else {
                swal({
                    title: 'warning',
                    text: 'create fail!',
                    type: 'warning',
                    confirmButtonText: 'OK'
                });
            }
        });
    }

    delete(){
        if (!this.map) return;
        swal({
            title: 'warning',
            text: "confirm delete map " + this.map.name + " ?",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel'
        }).then(result => {
            if (result.value) {
                this.mapService.delete(this.map._id).subscribe( res => {
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
        if (!this.map) return;
        swal({
            title: 'warning',
            text: "confirm update map " + this.map.name + " ?",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel'
        }).then(result => {
            if (result.value) {
                this.mapService.update(this.map).subscribe( res => {
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

}
