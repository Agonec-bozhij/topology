import {Injectable} from '@angular/core';
import {D3, D3Service, Selection} from 'd3-ng2-service';

import {GraphSimulation} from './topology-helpers/graph-simulation/graph-simulation';
import {GraphDragNDrop} from './topology-helpers/graph-drag-n-drop/graph-drag-n-drop';
import {GraphTick} from './topology-helpers/graph-tick/graph-tick';
import {GraphTooltip} from './topology-helpers/graph-tooltip/graph-tooltip';
import {GraphLink} from './topology-helpers/graph-link/graph-link';
import {GraphNode} from './topology-helpers/graph-node/graph-node';
import {GraphConfig} from './topology.models';
import {GraphMarker} from './topology-helpers/graph-marker/graph-marker';
import {TopologyComponent} from './topology.component';
import {GraphLocalData} from './topology-helpers/graph-local-data/graph-local-data';

@Injectable()
export class TopologyService {

    public graphSimulation: GraphSimulation;
    public graphDragDrop: GraphDragNDrop;
    public graphTick: GraphTick;
    public graphTooltip: GraphTooltip;
    public graphLink: GraphLink;
    public graphNode: GraphNode;
    public d3Svg: Selection<SVGSVGElement, any, null, undefined>;
    public graphConfig: GraphConfig;
    public graphMarker: GraphMarker;
    public graphTopology: TopologyComponent;
    public graphLocalData: GraphLocalData;

    public get d3(): D3 {
        return this.d3Service.getD3();
    }

    constructor(private d3Service: D3Service) {
    }

    public setSvg(nativeElement: any): void {
        let d3ParentElement: Selection<any, any, any, any>;
        d3ParentElement = this.d3.select(nativeElement).append('svg')
            .attr('width', this.graphConfig.width)
            .attr('height', this.graphConfig.height)
            .attr('viewBox', `0 0 ${this.graphConfig.viewBoxWidth} ${this.graphConfig.viewBoxHeight}`)
            .attr('preserveAspectRatio', 'xMidYMid');
        this.d3Svg = d3ParentElement;
    }
}
