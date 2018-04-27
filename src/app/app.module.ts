import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';


import {AppComponent} from './app.component';
import {D3Service} from 'd3-ng2-service';
import {TopologyModule} from './topology/topology.module';
import {HttpClientModule} from '@angular/common/http';


@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        TopologyModule,
        HttpClientModule
    ],
    providers: [
        D3Service
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
