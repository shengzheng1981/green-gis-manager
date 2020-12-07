import {NgModule} from '@angular/core';
import {DashboardComponent} from './dashboard.component';
import {RouterModule, Routes} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {NgZorroAntdModule} from 'ng-zorro-antd';

import { FeatureComponent } from './feature/feature.component';
import { GeojsonComponent } from './geojson/geojson.component';
import { BackendComponent } from './backend/backend.component';
import { FrontendComponent } from './frontend/frontend.component';
import { SymbolComponent } from './symbol/symbol.component';
import { StaticComponent } from './static/static.component';
import { MapComponent } from './map/map.component';
import { StreamComponent } from './stream/stream.component';


const routes: Routes = [
    {
        path: '',
        component: DashboardComponent,
        children: [
            {
                path: 'feature',
                component: FeatureComponent
            },
            {
                path: 'symbol',
                component: SymbolComponent
            },
            {
                path: 'map',
                component: MapComponent
            },
            {
                path: 'geojson',
                component: GeojsonComponent
            },
            {
                path: 'backend',
                component: BackendComponent
            },
            {
                path: 'frontend',
                component: FrontendComponent
            },
            {
                path: 'static',
                component: StaticComponent
            },
            {
                path: 'stream',
                component: StreamComponent
            },
            {
                path: '**',
                redirectTo: 'feature'
            }
        ]
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(routes),
        NgZorroAntdModule
    ],
    declarations: [DashboardComponent, FeatureComponent, GeojsonComponent, BackendComponent, FrontendComponent, SymbolComponent, StaticComponent, MapComponent, StreamComponent]
})
export class DashboardModule {
}
