import {NgModule} from '@angular/core';
import {SharedModule} from '../../shared/shared.module';
import {RouterModule, Routes} from '@angular/router';
import {DisplayComponent} from './display.component';
import {GeoJSONComponent} from './geojson/geojson.component';
import {FrontendComponent} from './frontend/frontend.component';
import {BackendComponent} from './backend/backend.component';


const routes: Routes = [
    {
        path: '',
        component: DisplayComponent,
        children: [
            {
                path: 'geojson',
                component: GeoJSONComponent
            },
            {
                path: 'frontend',
                component: FrontendComponent
            },
            {
                path: 'backend',
                component: BackendComponent
            },
            {path: '**', redirectTo: 'geojson'}
        ]
    }
];


@NgModule({
    imports: [
        SharedModule.forChild(),
        RouterModule.forChild(routes)
    ],
    declarations: [
        DisplayComponent, GeoJSONComponent, FrontendComponent, BackendComponent
    ]
})
export class DisplayModule {
}
