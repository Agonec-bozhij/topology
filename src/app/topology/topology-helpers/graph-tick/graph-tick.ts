import {D3Link, TopologyIp} from '../../topology.models';
import {AbstractGraphHelper} from '../abstract-graph-helper';
import {TopologyService} from '../../topology.service';

export class GraphTick extends AbstractGraphHelper {

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
     * Установка функции перемещения объектов графа
     */
    public setTickFunction(): () => void {
        const radius = this.config.nodeDiameter / 2;
        const maxX = this.config.viewBoxWidth - radius;
        const maxY = this.config.viewBoxHeight - radius;

        return () => {
            this.node
                .attr('cx', (d: TopologyIp) => {
                    return d.x = d.x < radius ? radius :
                        d.x > maxX ? maxX :
                            d.x;
                })
                .attr('cy', (d: TopologyIp) => {
                    return d.y = d.y < radius ? radius :
                        d.y > maxY ? maxY :
                            d.y;
                })
                .attr('transform', (d: TopologyIp) => {
                    return `translate(${d.x},${d.y})`;
                });

            this.link
                .attr('d', (d: D3Link) => {
                    let midX, midY;
                    if (d.position === 'single') {
                        // средняя точка нужна, чтобы на нее поставить маркер направления (атрибут marker-mid)
                        midX = (d.source.x + d.target.x) / 2;
                        midY = (d.source.y + d.target.y) / 2;
                        return `M ${d.source.x},${d.source.y} L ${midX},${midY} L ${d.target.x},${d.target.y}`;
                    } else {
                        const x1 = d.source.x;
                        const x2 = d.target.x;
                        const y1 = d.source.y;
                        const y2 = d.target.y;

                        const r = 10; // длинна смещения начала и конца отрезка от их изначальных позиций
                        const l = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)); // длина отрезка
                        let offsetX = r * (l !== 0 ? Math.abs(y1 - y2) / l : 0), // смещение по оси X
                            offsetY = r * (l !== 0 ? Math.abs(x1 - x2) / l : 0); // смещение по оси Y

                        // определяем четверть точки target относительно точки source
                        // и ставим соответствующий знак для смещения
                        if (x1 > x2 && y1 < y2) {
                            offsetX *= -1;
                            offsetY *= -1;
                        } else if (x1 < x2 && y1 < y2) {
                            offsetX *= -1;
                        } else if (x1 > x2 && y1 > y2) {
                            offsetY *= -1;
                        }
                        // средняя точка нужна, чтобы на нее поставить маркер направления (атрибут marker-mid)
                        midX = (d.source.x + offsetX + d.target.x + offsetX) / 2;
                        midY = (d.source.y + offsetY + d.target.y + offsetY) / 2;

                        if (d.position === 'primary') { // у нас два канала, поэтому один рисуем выше, второй ниже
                            return `M ${d.source.x + offsetX},${d.source.y + offsetY} L ${midX},${midY} L ${d.target.x + offsetX},${d.target.y + offsetY}`;
                        } else if (d.position === 'secondary') {
                            return `M ${d.source.x + offsetX},${d.source.y + offsetY} L ${midX},${midY} L ${d.target.x + offsetX},${d.target.y + offsetY}`;
                        }
                    }
                })
        }
    }
}
