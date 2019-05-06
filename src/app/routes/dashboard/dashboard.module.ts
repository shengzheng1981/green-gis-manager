import {NgModule} from '@angular/core';
import {DashboardComponent} from './dashboard.component';
import {RouterModule, Routes} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {NgZorroAntdModule} from 'ng-zorro-antd';
import {AccordionModule} from 'ngx-bootstrap/accordion';
import {ButtonsModule} from 'ngx-bootstrap/buttons';
import {ModalModule} from 'ngx-bootstrap/modal';
import {TooltipModule} from 'ngx-bootstrap/tooltip';
import {BsDropdownModule} from 'ngx-bootstrap/dropdown';
import {PaginationModule} from 'ngx-bootstrap/pagination';
import {ProgressbarModule} from 'ngx-bootstrap/progressbar';
import {CollapseModule} from 'ngx-bootstrap/collapse';

import { FeatureComponent } from './feature/feature.component';
import { GeojsonComponent } from './geojson/geojson.component';
import { BackendComponent } from './backend/backend.component';
import { FrontendComponent } from './frontend/frontend.component';
import { SymbolComponent } from './symbol/symbol.component';


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
        NgZorroAntdModule,
        AccordionModule.forRoot(),
        ButtonsModule.forRoot(),
        ModalModule.forRoot(),
        TooltipModule.forRoot(),
        BsDropdownModule.forRoot(),
        PaginationModule.forRoot(),
        ProgressbarModule.forRoot(),
        CollapseModule.forRoot()
    ],
    declarations: [DashboardComponent, FeatureComponent, GeojsonComponent, BackendComponent, FrontendComponent, SymbolComponent]
})
export class DashboardModule {
}
