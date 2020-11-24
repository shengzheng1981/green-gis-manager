import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgZorroAntdModule, NZ_I18N, zh_CN} from 'ng-zorro-antd';

/** 配置 angular i18n **/
import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';
registerLocaleData(zh);

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        FormsModule,
        NgZorroAntdModule
    ],
    exports: [
        CommonModule,
        FormsModule,
        NgZorroAntdModule
    ]
})
export class SharedModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: SharedModule,
            providers: [
                {provide: NZ_I18N, useValue: zh_CN}
            ]
        };
    }

    static forChild(): ModuleWithProviders {
        return {
            ngModule: SharedModule,
            providers: []
        };
    }
}
