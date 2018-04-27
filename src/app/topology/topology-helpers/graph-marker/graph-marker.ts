import {AbstractGraphHelper} from '../abstract-graph-helper';
import {TopologyService} from '../../topology.service';
import {Selection} from 'd3-ng2-service';

export class GraphMarker extends AbstractGraphHelper {

    public marker: Selection<SVGMarkerElement, any, any, any>;

    constructor(protected topologyService: TopologyService) {
        super();
        this.initialize();
    }

    /**
     * @inheritDoc
     */
    protected initialize(): void {
        this.marker = this.d3Svg.append('svg:defs').selectAll('marker').data(['end']).enter()
            .append<SVGMarkerElement>('svg:marker')
            .attr('id', 'end')
            .attr('refX', 15)
            .attr('refY', 15)
            .attr('markerWidth', 15)
            .attr('markerHeight', 15)
            .attr('markerUnits', 'userSpaceOnUse')
            .attr('viewBox', '0 0 30 30')
            .attr('orient', 'auto');

        this.marker.append('svg:polyline')
            .attr('points', '5,5 30,15 5,25 15,15 5,5')
            .attr('fill', '#000')
            .attr('stroke-width', 2)
            .attr('stroke', '#000');
    }
}
