import {AbstractGraphHelper} from '../abstract-graph-helper';
import {Selection} from 'd3-ng2-service';
import {TopologyService} from '../../topology.service';

export class GraphTooltip extends AbstractGraphHelper {

    public tooltipObject: Selection<HTMLElement, any, any, any>;

    constructor(protected topologyService: TopologyService) {
        super();
        this.initialize();
    }

    /**
     * @inheritDoc
     */
    protected initialize(): void {
        const tooltips = this.d3.select('div.graph-tooltip');
        if (tooltips.data().length !== 0) {
            tooltips.remove();
        }

        this.tooltipObject = this.d3.select('body')
            .append<HTMLElement>('div')
            .attr('class', 'graph-tooltip')
            .style('opacity', 0);
    };
}
