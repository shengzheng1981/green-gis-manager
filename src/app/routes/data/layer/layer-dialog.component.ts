import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {NzMessageService} from "ng-zorro-antd";
import {LayerService} from '../../../shared/services/layer.service';
import {FeatureService} from '../../../shared/services/feature.service';

@Component({
  selector: 'app-layer-dialog',
  templateUrl: './layer-dialog.component.html',
  styleUrls: ['./layer-dialog.component.scss']
})
export class LayerDialogComponent implements OnInit {

    @Output() onSubmit = new EventEmitter();

    object: any;       //bind object
    visible: boolean = false;

    classes: any = [];
    constructor(private layerService: LayerService, private featureService: FeatureService, private message: NzMessageService) { }

     async ngOnInit() {
         this.classes = await this.featureService.getAll().toPromise();
     }

    show() {
        this.object = {
            name: "Layer",
            min: 3,
            max: 20
        };
        this.visible = true;
    }

    submit(){
        this.layerService.create(this.object).subscribe( res => {
            if (res.result) {
                this.object._id = res.doc._id;
                this.message.create("success", "创建成功！");
                this.onSubmit.emit(this.object);
                this.visible = false;
            } else {
                this.message.create("warning", "图层名已存在！");
            }

        });
    }

    hide() {
        this.visible = false;
    }

    compareObject(o1: any, o2: any): boolean {
        return o1 && o2 ? o1._id === o2._id : o1 === o2;
    }
}
