import {TopologyService} from '../topology.service';
import {GraphConfig, TopologyIp, TopologyLink} from '../topology.models';
import {D3, Selection, Simulation} from 'd3-ng2-service';
import {GraphTick} from './graph-tick/graph-tick';
import {TopologyComponent} from '../topology.component';
import {GraphLocalData} from './graph-local-data/graph-local-data';

export abstract class AbstractGraphHelper {

    protected topologyService: TopologyService;

    protected get config(): GraphConfig {
        return this.topologyService.graphConfig;
    }

    protected get d3(): D3 {
        return this.topologyService.d3;
    }

    protected get d3Svg(): Selection<SVGSVGElement, any, null, undefined> {
        return this.topologyService.d3Svg;
    }

    protected get simulation(): Simulation<TopologyIp, TopologyLink> {
        return this.topologyService.graphSimulation.simulationObject;
    }

    protected get node(): Selection<SVGGElement, any, null, undefined> {
        return this.topologyService.graphNode.nodeObject;
    }

    protected get link(): Selection<SVGPathElement, any, null, undefined> {
        return this.topologyService.graphLink.linkObject;
    }

    protected get tooltip(): Selection<HTMLElement, any, null, undefined> {
        return this.topologyService.graphTooltip.tooltipObject;
    }

    protected get tick(): GraphTick {
        return this.topologyService.graphTick;
    }

    protected get topology(): TopologyComponent {
        return this.topologyService.graphTopology;
    }

    protected get localData(): GraphLocalData {
        return this.topologyService.graphLocalData;
    }

    constructor() {

    }

    /**
     * Инициализация компонента
     */
    protected abstract initialize(): void;
}
