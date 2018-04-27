import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TopologyComponent} from './topology.component';
import {TopologyService} from './topology.service';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        TopologyComponent
    ],
    exports: [
        TopologyComponent
    ]
})
export class TopologyModule {
}
