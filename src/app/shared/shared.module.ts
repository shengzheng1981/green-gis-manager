import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ConfigService} from './services/config.service';
import {FeatureService} from './services/feature.service';
import {SymbolService} from './services/symbol.service';
import {MapService} from './services/map.service';
import {LabelService} from './services/label.service';


@NgModule({
    imports: [
        CommonModule
    ],
    providers: [ConfigService, FeatureService, SymbolService, MapService, LabelService],
    declarations: [],
    exports: []
})
export class SharedModule {
}
