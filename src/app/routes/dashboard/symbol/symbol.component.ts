import {Component, OnInit} from '@angular/core';
import {SymbolService} from '../../../shared/services/symbol.service';
import {default as swal} from "sweetalert2";

@Component({
    selector: 'app-symbol',
    templateUrl: './symbol.component.html',
    styleUrls: ['./symbol.component.scss']
})
export class SymbolComponent implements OnInit {

    option = {
        type:  {
            name: 'Circle Marker Symbol',
            code: 10
        }
    };
    types: any = [
        {
            name: 'Circle Marker Symbol',
            code: 10
        },
        {
            name: 'Icon Marker Symbol',
            code: 11
        },
        {
            name: 'Simple Line Symbol',
            code: 20
        },
        {
            name: 'Simple Fill Symbol',
            code: 30
        }
    ];
    symbols :any = [];

    constructor(private symbolService: SymbolService) {
    }

    ngOnInit() {
        this.init();
    }

    async init(){
        this.symbols = await this.symbolService.getByType(this.option.type.code).toPromise();
        this.symbols.forEach( item => {
            item.name_2 = item.name;
            item.style_2 = Object.assign({}, item.style);
        })
    }

    active(item) {
        this.option.type = item;
        this.init();
    }

    startSymbolEdit(item) {
        item.edit = true;
    }

    cancelSymbolEdit(item) {
        item.edit = false;
        item.name_2 = item.name;
        item.style_2 = Object.assign({}, item.style);
    }

    saveSymbolEdit(item) {
        item.name = item.name_2;
        item.style = Object.assign({}, item.style_2);
        item.edit = false;
        this.symbolService.update(item).subscribe( res => {
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

    createSymbol(){
        const symbol: any = {
            "name": "Symbol",
            "type" : this.option.type.code,
            "style" : {
                "radius" : 6,
                "fillColor" : "#ff0000",
                "fillOpacity" : 0.5,
                "weight" : 2,
                "color" : "#ff0000",
                "opacity" : 1
            }
        };
        this.symbolService.create(symbol).subscribe( res => {
            symbol._id = res.doc._id;
            symbol.name_2 = symbol.name;
            symbol.style_2 = Object.assign({}, symbol.style);
            this.symbols.push(symbol);
        })
    }

    deleteSymbol(symbol) {
        this.symbolService.delete(symbol._id).subscribe( res => {
            const index = this.symbols.findIndex( item => item._id === symbol._id );
            this.symbols.splice(index, 1);
        });
    }

    upload(fileInput: any, symbol: any){
        const formData: any = new FormData();
        const files: Array<File> = <Array<File>>fileInput.target.files;
        let name = "";
        for(let i = 0; i < files.length; i++){

        }
    }
}
