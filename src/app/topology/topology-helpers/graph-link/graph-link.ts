import {Selection, ForceLink} from 'd3-ng2-service';
import {AbstractGraphHelper} from '../abstract-graph-helper';
import {isObject} from 'util';
import {TopologyService} from '../../topology.service';
import {D3Link, TopologyIp, TopologyLink} from '../../topology.models';

export class GraphLink extends AbstractGraphHelper {

    public linkObject: Selection<SVGPathElement, any, any, any>;

    constructor(protected topologyService: TopologyService) {
        super();
        this.initialize();
    }

    /**
     * @inheritDoc
     */
    protected initialize() {
        this.linkObject = this.d3Svg
            .append('g')
            .attr('class', 'links')
            .selectAll('line')
            .data(this.config.links, (d: { source: any, target: any }) => {
                const sourceId = isObject(d.source) ? d.source.id : d.source;
                const targetId = isObject(d.target) ? d.target.id : d.target;
                return sourceId + '-' + targetId;
            })
            .enter()
            .append<SVGPathElement>('path')
            .attr('class', 'link')
            .attr('stroke-width', 3)
            .style('marker-mid', (d) => {
                return 'url(#end)';
            })
            .datum((link: TopologyLink) => {
                const links = this.config.links.filter((d: TopologyLink) => {
                    return (link.source === d.source && link.target === d.target) || (link.source === d.target && link.target === d.source);
                });

                if (links.length === 1) {
                    link.position = 'single';
                } else {
                    if (links[0].source === link.source && links[0].target === link.target) {
                        link.position = 'primary';
                    } else {
                        link.position = 'secondary';
                    }
                }

                return link;
            })
            .on('dblclick', (link: D3Link) => {
                this.topology.linkDblClicked.next(link);
            })
            .on('click', (link: D3Link) => {
                this.topology.linkClicked.next(link);
            })
            .on('mouseover', (link: D3Link, index: number) => {
                this.linkObject.filter((item: D3Link, itemIndex: number) => itemIndex === index).attr('stroke-width', 6);
                this.tooltip.transition().duration(200).style('opacity', 1);
                this.tooltip.selectAll('*').remove();

                this.tooltip.append('div').attr('class', 'graph-tooltip__title').text('Канал связи');
                const tooltipWrapper = this.tooltip.append('div').attr('class', 'graph-tooltip__wrapper');

                const tooltipInfo = tooltipWrapper.append('div').attr('class', 'graph-tooltip__wrapper-info');
                tooltipInfo.append('div').attr('class', 'graph-tooltip__wrapper-info__title').text('Откуда:');
                tooltipInfo.append('div').attr('class', 'graph-tooltip__wrapper-info__text')
                    .text(link.from_ip);

                const tooltipInfo2 = tooltipWrapper.append('div').attr('class', 'graph-tooltip__wrapper-info');
                tooltipInfo2.append('div').attr('class', 'graph-tooltip__wrapper-info__title').text('Куда:');
                tooltipInfo2.append('div').attr('class', 'graph-tooltip__wrapper-info__text')
                    .text(link.to_ip);

                const tooltipInfo3 = tooltipWrapper.append('div').attr('class', 'graph-tooltip__wrapper-info');
                tooltipInfo3.append('div').attr('class', 'graph-tooltip__wrapper-info__title').text('Статус:');
                tooltipInfo3.append('div').attr('class', 'graph-tooltip__wrapper-info__text')
                    .text(link.status && link.status.name ? link.status.name : 'Не определен');

                this.tooltip.style('left', (this.d3.event.pageX + 20) + 'px')
                    .style('top', this.d3.event.pageY - 75 + 'px');
            })
            .on('mouseout', (link: D3Link, index: number) => {
                    this.linkObject.filter((item: D3Link, itemIndex: number) => itemIndex === index)
                        .attr('stroke-width', 3);
                    this.tooltip.transition().duration(500).style('opacity', 0);
                }
            );

        this.setStatusColor(this.linkObject);
    }

    /**
     * Принимает выборку элементов - каналов и меняет их цвета в зависимости от статуса.
     * @param {Selection<SVGPathElement, any, any, any>} selection
     */
    public setStatusColor(selection: Selection<SVGPathElement, any, null, undefined>): void {
        selection.style('stroke', (link: TopologyLink) => {
            if (link.status && isObject(link.status) && 'code' in link.status) {
                switch (link.status.code) {
                    case 'online':
                        return '#64dd17';
                    case 'offline':
                        return '#d50000';
                    case 'network':
                        return '#6d4c41';
                }
            }
            return '#bdbdbd';
        })
            .attr('stroke-dasharray', (d) => {
                if (d.status && d.status.code === 'network') {
                    return '5, 10';
                }
                return '0';
            });
    }

    /**
     * Создает канал.
     * @param {TopologyLink} link
     */
    public createLink(link: TopologyLink): void {
        this.config.links.push(link);

        this.linkObject = this.linkObject.data(this.config.links, (d: { source: any, target: any }) => {
            const sourceId = isObject(d.source) ? d.source.id : d.source;
            const targetId = isObject(d.target) ? d.target.id : d.target;
            return sourceId + '-' + targetId;
        });

        let needToSetPrimaryLink = false;

        this.linkObject.exit().remove();
        this.linkObject = this.linkObject.enter()
            .append<SVGPathElement>('path')
            .attr('class', 'link')
            .attr('stroke-width', 2)
            .style('marker-mid', () => {
                return 'url(#end)';
            })
            .datum((d: TopologyLink) => {
                const links = this.linkObject.filter((item: D3Link) => link.source === item.target.id && link.target === item.source.id);

                if (links.size() === 0) {
                    d.position = 'single';
                } else {
                    needToSetPrimaryLink = true;
                    d.position = 'secondary';
                }

                return d;
            })
            .on('dblclick', (d: D3Link) => {
                this.topology.linkDblClicked.next(d);
            })
            .on('mouseover', (d: D3Link, index: number) => {
                this.linkObject.filter((item: D3Link, itemIndex: number) => itemIndex === index).attr('stroke-width', 6);
                this.tooltip.transition().duration(200).style('opacity', 1);
                this.tooltip.selectAll('*').remove();

                this.tooltip.append('div').attr('class', 'graph-tooltip__title').text('Канал связи');
                const tooltipWrapper = this.tooltip.append('div').attr('class', 'graph-tooltip__wrapper');

                const tooltipInfo = tooltipWrapper.append('div').attr('class', 'graph-tooltip__wrapper-info');
                tooltipInfo.append('div').attr('class', 'graph-tooltip__wrapper-info__title').text('Откуда:');
                tooltipInfo.append('div').attr('class', 'graph-tooltip__wrapper-info__text')
                    .text(d.source.id);

                const tooltipInfo2 = tooltipWrapper.append('div').attr('class', 'graph-tooltip__wrapper-info');
                tooltipInfo2.append('div').attr('class', 'graph-tooltip__wrapper-info__title').text('Куда:');
                tooltipInfo2.append('div').attr('class', 'graph-tooltip__wrapper-info__text')
                    .text(d.target.id);

                const tooltipInfo3 = tooltipWrapper.append('div').attr('class', 'graph-tooltip__wrapper-info');
                tooltipInfo3.append('div').attr('class', 'graph-tooltip__wrapper-info__title').text('Статус:');
                tooltipInfo3.append('div').attr('class', 'graph-tooltip__wrapper-info__text')
                    .text(d.status && d.status.name ? d.status.name : 'Не определен');

                this.tooltip.style('left', (this.d3.event.pageX + 20) + 'px')
                    .style('top', this.d3.event.pageY - 75 + 'px');
            })
            .on('mouseout', (d: D3Link, index: number) => {
                    this.linkObject.filter((item: D3Link, itemIndex: number) => itemIndex === index)
                        .attr('stroke-width', 3);
                    this.tooltip.transition().duration(500).style('opacity', 0);
                }
            )
            .merge(this.linkObject);

        if (needToSetPrimaryLink) {
            this.linkObject
                .filter((item: D3Link) => link.source === item.target.id && link.target === item.source.id)
                .datum((d: D3Link) => {
                    d.position = 'primary';
                    return d;
                });
        }

        this.setStatusColor(this.linkObject);
        this.simulation.nodes(this.config.ips).on('tick', this.tick.setTickFunction());
        this.simulation.force<ForceLink<TopologyIp, TopologyLink>>('link').links(this.config.links);
        this.simulation.restart();
    }

    /**
     * Подсвечивает канал.
     * @param {Selection<SVGPathElement, any, any, any>} selection
     */
    public linkHighlight(selection: Selection<SVGPathElement, any, null, undefined>): void {
        selection.attr('stroke-width', 6)
            .style('stroke', '#ff5722');
    }

    /**
     * Убирает подсветку с канала.
     * @param {Selection<SVGPathElement, any, any, any>} selection
     */
    public removeLinkHighlight(selection: Selection<SVGPathElement, any, null, undefined>): void {
        selection.attr('stroke-width', 3);
        this.setStatusColor(selection);
    }

    public removeLink(selection: Selection<SVGPathElement, any, null, undefined>) {

    }
}
