import {TopologyIp} from '../../topology.models';
import {AbstractGraphHelper} from '../abstract-graph-helper';
import {TopologyService} from '../../topology.service';

export class GraphDragNDrop extends AbstractGraphHelper {

    constructor(protected topologyService: TopologyService) {
        super();
        this.initialize();
    }

    /**
     * @inheritDoc
     */
    protected initialize(): void {

    }

    /**
     * Возвращает поведение при начале эвента DragNDrop на узле.
     * @returns {(d: TopologyIp) => void}
     */
    public setDragStarted(): (this: GraphDragNDrop, d: TopologyIp) => void {
        return (d: TopologyIp) => {
            if (!this.d3.event.active) {
                this.simulation.alphaTarget(0.3).restart();
            }
            d.fx = d.x;
            d.fy = d.y;
            this.tooltip.transition().duration(0).style('opacity', 0);
        };
    }

    /**
     * Возвращает поведение при эвенте DragNDrop во время перетаскивания узла
     * (не учитывается поведение срабатывания и окончания эвента DragNDrop).
     * @returns {(d: TopologyIp) => void}
     */
    public setDragged(): (this: GraphDragNDrop, d: TopologyIp) => void {
        return  (d: TopologyIp) => {
            const radius: number = (this.config.nodeDiameter / 2);
            const maxX: number = this.config.viewBoxWidth - (this.config.nodeDiameter / 2);
            const maxY: number = this.config.viewBoxHeight - (this.config.nodeDiameter / 2);
            d.fx = this.d3.event.x < radius ? radius :
                this.d3.event.x > maxX ? maxX :
                    this.d3.event.x;
            d.x = d.fx;

            d.fy = this.d3.event.y < radius ? radius :
                this.d3.event.y > maxY ? maxY :
                    this.d3.event.y;
            d.y = d.fy;
            this.tooltip.transition().duration(0).style('opacity', 0);
        };
    }

    /**
     * Возвращает поведение при окончании эвента DragNDrop.
     * @returns {(d: TopologyIp) => void}
     */
    public setDragEnded(): (this: GraphDragNDrop, d: TopologyIp) => void {
        return (d: TopologyIp) => {
            if (!this.d3.event.active) {
                this.simulation.alphaTarget(0);
            }

            if (!this.config.gravityOn) this.localData.saveOnDrag(d.id, d.x, d.y);
            d.fx = null;
            d.fy = null;
        };
    }
}
