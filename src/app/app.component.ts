import { Component } from '@angular/core';
import {ConfigService} from './shared/services/config.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
    dataVisible : boolean = true;
    displayVisible : boolean = false;

    constructor(public configService: ConfigService) {

    }
}
