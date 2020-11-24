import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {APP_INITIALIZER, NgModule} from '@angular/core';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import {LoadingBarHttpClientModule} from '@ngx-loading-bar/http-client';

import {AppComponent} from './app.component';

import {RoutesModule} from './routes/routes.module';
import {SharedModule} from './shared/shared.module';
import {ConfigService} from './shared/services/config.service';


@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        LoadingBarHttpClientModule,
        RoutesModule,
        SharedModule.forRoot()
    ],
    providers: [{
        provide: APP_INITIALIZER,
        useFactory: (config: ConfigService) => () => config.load('assets/json/config.json'),
        deps: [ConfigService],
        multi: true
    }],
    bootstrap: [AppComponent]
})
export class AppModule {
}
