import {NgModule} from '@angular/core';
import {SharedModule} from '../../shared/shared.module';
import {RouterModule, Routes} from '@angular/router';
import {DataComponent} from './data.component';
import {FeatureComponent} from './feature/feature.component';
import {MapComponent} from './map/map.component';
import {SymbolComponent} from './symbol/symbol.component';
import {LayerComponent} from './layer/layer.component';
import {LayerDialogComponent} from './layer/layer-dialog.component';

const routes: Routes = [
    {
        path: '',
        component: DataComponent,
        children: [
            {
                path: 'feature',
                component: FeatureComponent
            },
            {
                path: 'layer',
                component: LayerComponent
            },
            {
                path: 'map',
                component: MapComponent
            },
            {
                path: 'symbol',
                component: SymbolComponent
            },
            {path: '**', redirectTo: 'feature'}
        ]
    }
];

@NgModule({
    imports: [
        SharedModule.forChild(),
        RouterModule.forChild(routes)
    ],
    declarations: [
        DataComponent, FeatureComponent, MapComponent, SymbolComponent, LayerComponent, LayerDialogComponent
    ]
})
export class DataModule {
}
