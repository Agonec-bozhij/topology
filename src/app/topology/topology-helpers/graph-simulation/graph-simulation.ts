import {ForceLink, Simulation, ForceCollide} from 'd3-ng2-service';
import {D3Link, TopologyIp, TopologyLink} from '../../topology.models';
import {AbstractGraphHelper} from '../abstract-graph-helper';
import {TopologyService} from '../../topology.service';
import {isObject} from 'util';
import {ForceCenter, ForceManyBody} from 'd3-force';

export class GraphSimulation extends AbstractGraphHelper {

    public simulationObject: Simulation<TopologyIp, TopologyLink>;

    constructor(protected topologyService: TopologyService) {
        super();
        this.initialize();
    }

    /**
     * @inheritDoc
     */
    protected initialize(): void {
        this.simulationObject = this.d3.forceSimulation(this.config.ips);
    }

    /**
     * Пересчитать гравитацию для элементов графа
     */
    public calculateSimulation(): void {
        if (this.config.gravityOn) {
            this.turnOnGravity();
        } else {
            console.log('gravity off');
            this.turnOffGravity();
        }
    }

    /**
     * Включение/отключение гравитации.
     */
    public gravityToggle(): void {
        this.config.gravityOn = !this.config.gravityOn;

        if (this.config.gravityOn) {
            this.turnOnGravity();
        } else {
            this.turnOffGravity();
        }

        this.localData.gravityToggle();
    }

    /**
     * Включение гравитации.
     */
    private turnOnGravity() {
        this.setSimulation();
    }

    /**
     * Отключение гравитации.
     */
    private turnOffGravity() {
        this.simulationObject.force('link', this.forceLink)
            .force('center', null)
            .force('collisionForce', null)
            .force('repelForce', null)
            .force('attractForce', null);

        this.simulationObject.nodes(this.config.ips).on('tick', this.topologyService.graphTick.setTickFunction());
        this.simulationObject.force<ForceLink<TopologyIp, TopologyLink>>('link').links(this.config.links);
        this.simulationObject.alphaTarget(0).restart();
    }

    /**
     * Установка расчетов вычисления гравитации.
     */
    public setSimulation(): void {
        this.simulationObject.force('link', this.forceLink)
            .force('center', this.centerForce)
            .force('collisionForce', this.collisionForce)
            .force('repelForce', this.repelForce)
            .force('attractForce', this.attractForce);

        this.simulationObject.nodes(this.config.ips).on('tick', this.topologyService.graphTick.setTickFunction());
        this.simulationObject.force<ForceLink<TopologyIp, TopologyLink>>('link').links(this.config.links);
        this.simulationObject.alphaTarget(0).restart();
    }

    /**
     * Возвращает силу притяжения каналов.
     * @returns {any | ((link: LinkDatum, i: number, links: LinkDatum[]) => number) | any | ((link: LinkDatum, i: number, links: LinkDatum[]) => number) | this}
     */
    private get forceLink() {
        return this.d3.forceLink().id((d: TopologyIp) => d.id)
            .distance((link: D3Link) => this.shouldLinkBeShort(link) ? 50 : 250)
            .strength(this.config.gravityOn ? 1 : 0);
    }

    /**
     * Возвращает силу столкновения.
     * @returns {ForceCollide<TopologyIp>}
     */
    private get collisionForce(): ForceCollide<TopologyIp> {
        return <ForceCollide<TopologyIp>>this.d3.forceCollide()
            .radius((node: TopologyIp) => {
                const linksCount = this.nodeHaveLinks(node);
                return linksCount === 5 ? 120 : linksCount > 1 ? 80 : 50;
            })
            .strength(1)
            .iterations(100);
    }

    /**
     * Возвращает силу отторжения.
     * @returns {ForceManyBody<TopologyIp>}
     */
    private get repelForce(): ForceManyBody<TopologyIp> {
        return <ForceManyBody<TopologyIp>>this.d3.forceManyBody()
            .strength((node: TopologyIp) => this.nodeHaveLinks(node) > 0 ? -1 : 1);
    }

    /**
     * Возвращает силу притяжения.
     * @returns {ForceManyBody<TopologyIp>}
     */
    private get attractForce(): ForceManyBody<TopologyIp> {
        return <ForceManyBody<TopologyIp>>this.d3.forceManyBody().strength(1).distanceMax(100).distanceMin(10);
    }

    /**
     * Возвращает силу притяжения к центру
     * @returns {ForceCenter<TopologyIp>}
     */
    private get centerForce(): ForceCenter<TopologyIp> {
        return this.d3.forceCenter(this.config.viewBoxWidth / 2, this.config.viewBoxHeight / 2);
    }

    /**
     * Осуществляет поиск количества связей узла.
     * Возвращает количество связей, в которых участвует узел, но не больше двух.
     * Если метод нашел две связи, то он выходит из цикла
     * @param {TopologyIp} node
     * @returns {number}
     */
    private nodeHaveLinks(node: TopologyIp): number {
        let linksCount = 0;
        const links: any[] = this.config.links;
        for (const item of links) {
            const sourceId = isObject(item.source) ? item.source.id : item.source;
            const targetId = isObject(item.target) ? item.target.id : item.target;

            if (sourceId === node.id || targetId === node.id) {
                linksCount++;
            }
            if (linksCount === 5) break;
        }
        return linksCount;
    }

    /**
     * Осуществляет поиск количества связей на каждом конце линка.
     * Если на одном из концов всего одна связь - то есть сам аргумент - связь необходимо рисовать короче.
     * @param {D3Link} link
     * @returns {boolean}
     */
    private shouldLinkBeShort(link: D3Link): boolean {
        let sourceCount = 0;
        let targetCount = 0;
        const links: any[] = this.config.links;
        for (const item of links) {
            if (sourceCount < 2 && (item.source.id === link.source.id || item.target.id === link.source.id)) sourceCount++;
            if (targetCount < 2 && (item.source.id === link.target.id || item.target.id === link.target.id)) targetCount++;
            if (sourceCount > 1 && targetCount > 1) break;
        }
        return sourceCount === 1 || targetCount === 1;
    }
}
