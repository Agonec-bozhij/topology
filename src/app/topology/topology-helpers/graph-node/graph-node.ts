import {EnterElement, Selection} from 'd3-ng2-service';
import {TopologyIp} from '../../topology.models';
import {AbstractGraphHelper} from '../abstract-graph-helper';
import {TopologyService} from '../../topology.service';

export class GraphNode extends AbstractGraphHelper {

    public nodeObject: Selection<SVGGElement, TopologyIp, any, any>;

    constructor(protected topologyService: TopologyService) {
        super();
        this.initialize();
    }

    /**
     * @inheritDoc
     */
    protected initialize(): void {
        const enterSelection = this.d3Svg
            .selectAll('g.node')
            .data<TopologyIp>(this.config.ips)
            .enter();

        this.nodeObject = this.appendNodeMainElement(enterSelection);
        this.appendCircleForSelected(this.nodeObject);
        this.appendNodeType(this.nodeObject);
        this.appendNodeStatus(this.nodeObject);
        this.addDblClickBehavior(this.nodeObject);
        this.addHoverBehavior(this.nodeObject);
        this.addClickBehavior(this.nodeObject);
    }

    /**
     * Добавляет к выборке элемент, который будет являться оберткой для каждого хоста.
     * @param {Selection<SVGGElement, TopologyIp, any, any>} selection
     * @returns {Selection<SVGGElement, TopologyIp, any, any>}
     */
    private appendNodeMainElement(selection: Selection<EnterElement, TopologyIp, any, any>): Selection<SVGGElement, TopologyIp, any, any> {
        return selection.append<SVGGElement>('g')
            .attr('class', 'node')
            .call(this.d3.drag<any, TopologyIp>()
                .on('start', this.topologyService.graphDragDrop.setDragStarted())
                .on('drag', this.topologyService.graphDragDrop.setDragged())
                .on('end', this.topologyService.graphDragDrop.setDragEnded())
            );
    }

    /**
     * Добавляет прозрачный круг за узлом, который будет подсвечиваться при выборе узла.
     * @param {Selection<EnterElement, TopologyIp, any, any>} selection
     */
    private appendCircleForSelected(selection: Selection<EnterElement, TopologyIp, null, undefined>): void {
        selection.append('circle')
            .attrs({
                'class': 'circle-selected',
                'r': this.config.nodeDiameter / 1.5,
                'fill': 'transparent'
            })
            .attr('stroke', (d) => d.isNetworkDevice ? '#2962ff' : null)
            .attr('stroke-width', (d) => d.isNetworkDevice ? 6 : null)
            .attr('stroke-dasharray', (d) => d.isNetworkDevice ? '15 10' : null);
    }

    /**
     * Добавляет в обертку хоста иконку с его типом.
     * @param {Selection<SVGGElement, TopologyIp, any, any>} selection
     */
    private appendNodeType(selection: Selection<SVGGElement, TopologyIp, null, undefined>): void {
        selection.append('svg:image')
            .attr('class', 'host-type')
            .attr('xlink:href', (node: TopologyIp) => {
                const type: string = node.isNetworkDevice ? 'router' :
                    node.host && node.host.host_type && 'code' in node.host.host_type ? node.host.host_type.code : 'unknown';
                return '/assets/images/topology/host-types/' + type + '.png';
            })
            .attr('x', -this.config.nodeDiameter / 2)
            .attr('y', -this.config.nodeDiameter / 2)
            .attr('width', this.config.nodeDiameter)
            .attr('height', this.config.nodeDiameter);
    }

    /**
     * Добавляет в обертку хоста иконку с его статусом.
     * @param {Selection<SVGGElement, TopologyIp, any, any>} selection
     */
    private appendNodeStatus(selection: Selection<SVGGElement, TopologyIp, null, undefined>): void {

        selection.append('svg:image')
            .attrs({
                'class': 'host-status',
                'xlink:href': (node: TopologyIp) => {
                    let status: 'offline' | 'online' | 'unknown';
                    if (node.isNetworkDevice) {
                        status = 'online';
                        node.interfaces.forEach(item => {
                            if (item.host && item.host.status && 'code' in item.host.status) {
                                if (item.host.status.code === 'offline') status = 'offline';
                                if (item.host.status.code === 'unknown' && status !== 'offline') status = 'unknown';
                            } else {
                                if (status !== 'offline') status = 'unknown'
                            }
                        });
                       node.networkStatus = {code: status};
                    } else {
                        status = node.host && node.host.status && 'code' in node.host.status ? node.host.status.code : 'unknown';
                    }

                    return `/assets/images/topology/host-statuses/${status}.png`;
                },
                x: 16,
                y: 3,
                width: 18,
                height: 18
            });
    }

    /**
     * Добавляет поведение при двойном клике по узлу.
     * @param {Selection<SVGGElement, TopologyIp, any, any>} selection
     */
    private addDblClickBehavior(selection: Selection<SVGGElement, TopologyIp, null, undefined>): void {
        selection
            .on('dblclick', (ip: TopologyIp) => {
                this.topology.nodeDblClicked.next(ip);
            });
    }

    /**
     * Добавляет поведение при клике по узлу.
     * @param {Selection<SVGGElement, TopologyIp, any, any>} selection
     */
    private addClickBehavior(selection: Selection<SVGGElement, TopologyIp, null, undefined>): void {
        selection
            .on('click', (ip: TopologyIp) => {
                this.topology.nodeClicked.next(ip);
            })
    }

    /**
     * Добавляет поведение при наведении на узел.
     * Наполняет тултип данными и отображает его.
     * @param {Selection<SVGGElement, TopologyIp, any, any>} selection
     */
    private addHoverBehavior(selection: Selection<SVGGElement, TopologyIp, null, undefined>): void {
        selection.on('mouseover', (ip: TopologyIp) => {
            this.tooltip.transition().duration(200).style('opacity', 1);
            this.tooltip.selectAll('*').remove();

            this.tooltip.append('div').attr('class', 'graph-tooltip__title').text('Узел сети');
            const tooltipWrapper = this.tooltip.append('div').attr('class', 'graph-tooltip__wrapper');

            if (!ip.isNetworkDevice) {
                const tooltipInfo = tooltipWrapper.append('div').attr('class', 'graph-tooltip__wrapper-info');
                tooltipInfo.append('div').attr('class', 'graph-tooltip__wrapper-info__title').text('IP - адрес:');
                tooltipInfo.append('div').attr('class', 'graph-tooltip__wrapper-info__text')
                    .text(ip.discovered_ip);
            }

            const tooltipInfo2 = tooltipWrapper.append('div').attr('class', 'graph-tooltip__wrapper-info');
            const type = ip.isNetworkDevice ? 'Сетевое устройство' :
                ip.host && ip.host.host_type ? ip.host.host_type.name : 'Не определен';
            tooltipInfo2.append('div').attr('class', 'graph-tooltip__wrapper-info__title').text('Тип:');
            tooltipInfo2.append('div').attr('class', 'graph-tooltip__wrapper-info__text')
                .text(type);

            const tooltipInfo3 = tooltipWrapper.append('div').attr('class', 'graph-tooltip__wrapper-info');
            tooltipInfo3.append('div').attr('class', 'graph-tooltip__wrapper-info__title').text('Статус:');
            tooltipInfo3.append('div').attr('class', 'graph-tooltip__wrapper-info__text')
                .text(ip.host && ip.host.status ? ip.host.status.name : 'Не определен');

            if (ip.isNetworkDevice) {
                const tooltipInfo = tooltipWrapper.append('div').attr('class', 'graph-tooltip__wrapper-info');
                tooltipInfo.append('div').attr('class', 'graph-tooltip__wrapper-info__title').text('Интерфейсы:');
                const interfaces = tooltipInfo.append('div').attr('class', 'graph-tooltip__wrapper-info__interfaces');
                ip.interfaces.forEach(item => {
                    const row = interfaces.append('div').attr('class', 'graph-tooltip__wrapper-info__interfaces-row');
                    const hostType: string = item.host && item.host.host_type && 'code' in item.host.host_type ? item.host.host_type.code : 'unknown';
                    const status: string = item.host && item.host.status && 'code' in item.host.status ? item.host.status.code : 'unknown';
                    row.append('div').attr('class', 'graph-tooltip__wrapper-info__interfaces-title')
                        .text(item.id);
                    row.append('div').attr('class', 'spacer');
                    row.append('div').attr('class', 'graph-tooltip__wrapper-info__interfaces-type')
                        .append('img').attr('src', `/assets/images/topology/host-types/${hostType}.png`);
                    row.append('div').attr('class', 'graph-tooltip__wrapper-info__interfaces-status')
                        .append('img').attr('src', `/assets/images/topology/host-statuses/${status}.png`);
                });
            }

            this.tooltip.style('left', (this.d3.event.pageX + 20) + 'px')
                .style('top', this.d3.event.pageY - 75 + 'px');
        })
            .on('mouseout', () => {
                    this.tooltip.transition().duration(500).style('opacity', 0);
                }
            );
    }

    /**
     * Принимает выборку элементов - хостов и меняет иконки их статусов в зависимости от статуса.
     * @param {Selection<SVGGElement, any, any, any>} selection
     */
    public setStatusIcon(selection: Selection<SVGGElement, any, null, undefined>): void {
        selection.select('.host-status')
            .attr('xlink:href', (node: TopologyIp) => {
                let status: 'offline' | 'online' | 'unknown';
                if (node.isNetworkDevice) {
                    status = 'online';
                    node.interfaces.forEach(item => {
                        if (item.host && item.host.status && 'code' in item.host.status) {
                            if (item.host.status.code === 'offline') status = 'offline';
                            if (item.host.status.code === 'unknown' && status !== 'offline') status = 'unknown';
                        } else {
                            if (status !== 'offline') status = 'unknown'
                        }
                    })
                } else {
                    status = node.host && node.host.status && 'code' in node.host.status ? node.host.status.code : 'unknown';
                }
                node.host.status.code = status;
                return `/assets/images/topology/host-statuses/${status}.png`;
            });
    }

    /**
     * Принимает выборку элементов - хостов и меняет иконки их типов в зависимости от типа.
     * @param {Selection<SVGGElement, any, any, any>} selection
     */
    public setTypeIcon(selection: Selection<SVGGElement, any, null, undefined>): void {
        selection.select('.host-type')
            .attr('xlink:href', (node: TopologyIp) => {
                const type: string = node.host && node.host.host_type && 'code' in node.host.host_type ? node.host.host_type.code : 'unknown';
                return `/assets/images/topology/host-types/${type}.png`;
            });
    }

    /**
     * Создает хост.
     * @param {TopologyIp} ip
     */
    public createNode(ip: TopologyIp): void {
        this.config.ips.push(ip);

        this.nodeObject = this.nodeObject.data(this.config.ips, (node: TopologyIp) => node.id);
        this.nodeObject.exit().remove();

        const enterSelection = this.nodeObject.enter();
        const nodeSelection = this.appendNodeMainElement(enterSelection);

        nodeSelection.each((d: TopologyIp) => {
            d.x = Math.round(Math.random() * this.config.viewBoxWidth);
            d.y = Math.round(Math.random() * this.config.viewBoxHeight);
        });

        this.appendCircleForSelected(nodeSelection);
        this.appendNodeType(nodeSelection);
        this.appendNodeStatus(nodeSelection);
        this.addDblClickBehavior(nodeSelection);
        this.addHoverBehavior(nodeSelection);
        this.addClickBehavior(nodeSelection);

        this.nodeObject = nodeSelection.merge(this.nodeObject);

        this.topologyService.graphSimulation.setSimulation();
        this.simulation.restart();
    }

    /**
     * Подсвечивает элемент.
     * @param {Selection<SVGGElement, any, any, any>} selection
     */
    public nodeHighlight(selection: Selection<SVGGElement, any, null, undefined>): void {
        // selection.append('rect')
        //     .attr('class', 'rect-hover')
        //     .attr('x', -24)
        //     .attr('y', 24)
        //     .attr('width', 56)
        //     .attr('height', 5)
        //     .style('fill', '#263238');
        selection.select('circle.circle-selected')
            .attr('fill', '#fb8c00');
    }

    /**
     * Убирает подсветку с элемента.
     * @param {Selection<SVGGElement, any, any, any>} selection
     */
    public removeNodeHighlight(selection: Selection<SVGGElement, any, null, undefined>): void {
        // selection.select('rect.rect-hover')
        //     .remove();
        selection.select('circle.circle-selected')
            .attr('fill', 'transparent');
    }

    /**
     * Подсвечивает элемент, заливает цветом кружок за ним.
     * @param {Selection<SVGGElement, any, any, any>} selection
     */
    public selectNode(selection: Selection<SVGGElement, any, null, undefined>): void {
        selection.select('circle.circle-selected')
            .attr('fill', '#fb8c00');
    }

    /**
     * Убирает подсветку элемента.
     * @param {Selection<SVGGElement, any, any, any>} selection
     */
    public removeNodeSelect(selection: Selection<SVGGElement, any, null, undefined>): void {
        selection.select('circle.circle-selected')
            .attr('fill', 'transparent');
    }

    /**
     * Убирает подсветку со всех элементов.
     */
    public removeSelection(): void {
        this.nodeObject.select('circle.circle-selected')
            .attr('fill', 'transparent');
    }
}
