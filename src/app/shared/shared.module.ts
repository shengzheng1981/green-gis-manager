import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ConfigService} from './services/config.service';
import {FeatureService} from './services/feature.service';
import {SymbolService} from './services/symbol.service';


@NgModule({
    imports: [
        CommonModule
    ],
    providers: [ConfigService, FeatureService, SymbolService],
    declarations: [],
    exports: []
})
export class SharedModule {
}
