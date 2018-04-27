import {AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {D3Link, GraphConfig, TopologyHost, TopologyIp, TopologyLink} from './topology.models';
import {GraphSimulation} from './topology-helpers/graph-simulation/graph-simulation';
import {TopologyBuilder} from './topology.builder';
import {GraphDragNDrop} from './topology-helpers/graph-drag-n-drop/graph-drag-n-drop';
import {GraphTick} from './topology-helpers/graph-tick/graph-tick';
import {GraphTooltip} from './topology-helpers/graph-tooltip/graph-tooltip';
import {GraphLink} from './topology-helpers/graph-link/graph-link';
import {GraphNode} from './topology-helpers/graph-node/graph-node';
import {TopologyService} from './topology.service';
import {GraphMarker} from './topology-helpers/graph-marker/graph-marker';
import {GraphLocalData} from './topology-helpers/graph-local-data/graph-local-data';

@Component({
    selector: 'app-topology',
    template: ``,
    styleUrls: ['./topology.component.scss'],
    providers: [
        TopologyService
    ]
})
export class TopologyComponent extends TopologyBuilder implements OnInit, AfterViewInit, OnDestroy {

    /**
     * Эвент, сообщающий, что топология загрузилась.
     * Возвращает объект класса топологии.
     * @type {EventEmitter<TopologyComponent>}
     */
    @Output()
    public load: EventEmitter<TopologyComponent> = new EventEmitter<TopologyComponent>();

    /**
     * Эвент, сообщающий о двойном клике по узлу.
     * Возвращает объект узла.
     * @type {EventEmitter<TopologyIp>}
     */
    @Output()
    public nodeDblClicked: EventEmitter<TopologyIp> = new EventEmitter<TopologyIp>();

    /**
     * Эвент, сообщающий о клике по узлу.
     * Возвращает объект узла.
     * @type {EventEmitter<TopologyIp>}
     */
    @Output()
    public nodeClicked: EventEmitter<TopologyIp> = new EventEmitter<TopologyIp>();

    /**
     * Эвент, сообщающий о клике по каналу.
     * Возвращает объект канала.
     * @type {EventEmitter<D3Link>}
     */
    @Output()
    public linkClicked: EventEmitter<D3Link> = new EventEmitter<D3Link>();

    /**
     * Эвент, сообщающий о двойном клике по каналу.
     * Возвращает объект канала.
     * @type {EventEmitter<D3Link>}
     */
    @Output()
    public linkDblClicked: EventEmitter<D3Link> = new EventEmitter<D3Link>();

    /**
     * Геттер для конфига топологии.
     * @returns {GraphConfig}
     */
    public get config(): GraphConfig {
        return this.topologyService.graphConfig;
    }

    /**
     * Загрузка конфига
     * @param {GraphConfig} config
     */
    public set config(config: GraphConfig) {
        if (!this.topologyService.graphConfig) {
            const conf = {...(new GraphConfig()), ...config};
            if (conf.height) {
                conf.viewBoxHeight = conf.viewBoxWidth / (conf.width / conf.height);
            } else {
                conf.height = conf.width / (conf.viewBoxWidth / conf.viewBoxHeight);
            }

            this.topologyService.graphConfig = conf;
            this.topologyService.graphTopology = this;
            this.initializeService();
        }
    }

    constructor(private topologyService: TopologyService, private el: ElementRef) {
        super();
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        this.load.next(this);
    }

    /**
     * Загрузка в сервис инициализирующих данных и построение компонентов графа.
     */
    private initializeService(): void {
        this.topologyService.setSvg(this.el.nativeElement);
        this.build();
        this.topologyService.graphSimulation.calculateSimulation();
    }

    /**
     * @inheritDoc
     */
    protected setLocalData(): void {
        this.topologyService.graphLocalData = new GraphLocalData(this.topologyService);
    }

    /**
     * @inheritDoc
     */
    protected setSimulation(): void {
        this.topologyService.graphSimulation = new GraphSimulation(this.topologyService);
    }

    /**
     * @inheritDoc
     */
    protected setDragNDrop(): void {
        this.topologyService.graphDragDrop = new GraphDragNDrop(this.topologyService);
    }

    /**
     * @inheritDoc
     */
    protected setTick(): void {
        this.topologyService.graphTick = new GraphTick(this.topologyService);
    }

    /**
     * @inheritDoc
     */
    protected setTooltip(): void {
        this.topologyService.graphTooltip = new GraphTooltip(this.topologyService);
    }

    /**
     * @inheritDoc
     */
    protected setLinks(): void {
        this.topologyService.graphLink = new GraphLink(this.topologyService);
    }

    /**
     * @inheritDoc
     */
    protected setNodes(): void {
        this.topologyService.graphNode = new GraphNode(this.topologyService);
    }

    /**
     * @inheritDoc
     */
    protected setMarker(): void {
        this.topologyService.graphMarker = new GraphMarker(this.topologyService);
    }


    /**
     * Принимает объект канала связи, затем осуществляет поиск данного канала.
     * Если канал найден - меняет у него статус и цвет, в противном случае пытается создать канал.
     * @param {TopologyLink} link
     */
    public updateLink(link: TopologyLink): void {
        const links = this.topologyService.graphLink.linkObject.filter((item: D3Link) => {
            return item.source.id === link.source && item.target.id === link.target;
        });

        if (links.size() === 1) {
            links.datum((item: D3Link) => {
                item.status = link.status;
                return item;
            });
            this.topologyService.graphLink.setStatusColor(links);
        } else if (links.size() === 0) {
            this.createLink(link);
        }
    }

    /**
     * Принимает объект канала связи, затем осуществляет поиск данного канала.
     * Если канал не найден - пытается создать канал.
     * @param {TopologyLink} link
     */
    public createLink(link: TopologyLink): void {
        const links = this.topologyService.graphLink.linkObject.filter((item: D3Link) => {
            return item.source.id === link.source && item.target.id === link.target;
        });

        const nodes = this.topologyService.graphNode.nodeObject.filter((item: TopologyIp) => {
            return item.id === link.source || item.id === link.target;
        });

        if (links.size() === 0 && nodes.size() === 2) {
            this.topologyService.graphLink.createLink(link);
        }
    }

    public setNetworkDeviceLink(link: TopologyLink, devicePosition: 'from' | 'to', deviceName: string, operation: 'create' | 'update'): void {
        if (devicePosition === 'from') {
            link.source = deviceName;
        } else {
            link.target = deviceName;
        }

        if (operation === 'create') {
            this.createLink(link);
        } else {
            this.updateLink(link);
        }
    }

    /**
     * Проверяет, есть ли в выборке уже такой IP, и если нету, то создает его
     * @param {TopologyIp} ip
     */
    public createNode(ip: TopologyIp): void {
        const hosts = this.topologyService.graphNode.nodeObject.filter((item: TopologyIp) => item.id === ip.id);

        if (hosts.size() === 0) {
            this.topologyService.graphNode.createNode(ip);
        }
    }

    public addNetworkDevice(deviceName: string, node: TopologyIp): void {
        const devices = this.topologyService.graphNode.nodeObject.filter(item => item.id === deviceName);

        devices.datum((d) => {
            const deviceIndex = d.interfaces.findIndex(item => item.id === node.id);

            if (deviceIndex === -1) {
                d.interfaces.push(node);
                this.topologyService.graphNode.setStatusIcon(devices);
            }

            return d;
        });
    }

    public updateNetworkDevice(deviceName: string, host: TopologyHost): void {
        const devices = this.topologyService.graphNode.nodeObject.filter(item => {
            return item.id === deviceName;
        });

        devices.datum((d) => {
            const deviceIndex = d.interfaces.findIndex(item => item.id === host.host_ip);

            if (deviceIndex === -1) {
                d.interfaces[deviceIndex].host = host;
                this.topologyService.graphNode.setStatusIcon(devices);
            }

            return d;
        });
    }

    /**
     * Ищет хост и если находит - перезаписывает его и обновляет тип и статус в графе.
     * @param {TopologyHost} host
     */
    public updateHost(host: TopologyHost): void {
        const ips = this.topologyService.graphNode.nodeObject.filter((item: TopologyIp) => item.id === host.host_ip);

        if (ips.size() === 1) {
            let needToChangeStatus = false, needToChangeType = false;
            ips.datum((item: TopologyIp) => {
                if (!item.host || !item.host.status || !item.host.status.code || item.host.status.code !== host.status.code) needToChangeStatus = true;
                if (!item.host || !item.host.host_type || !item.host.host_type.code || item.host.host_type.code !== host.host_type.code) needToChangeType = true;
                item.host = host;
                return item;
            });

            if (needToChangeStatus) this.topologyService.graphNode.setStatusIcon(ips);
            if (needToChangeType) this.topologyService.graphNode.setTypeIcon(ips);
        }
    }

    /**
     * Включение/отключение гравитации.
     */
    public gravityToggle(): void {
        this.topologyService.graphSimulation.gravityToggle();
    }

    /**
     * Перезагружает граф.
     * Получает элементы, из которых будет построен новый граф.
     * Стирает все элементы, перезаписывает узлы и каналы и заново начинает строиться.
     * @param {TopologyIp[]} ips
     * @param {TopologyLink[]} links
     */
    public reloadData(ips: TopologyIp[], links: TopologyLink[]): void {
        this.topologyService.d3.select(this.el.nativeElement).select('svg').remove();
        this.config.ips = ips;
        this.config.links = links;
        this.initializeService();
    }

    /**
     * Находит элемент и, исходя из второго параметра "highlight" либо подсвечивает его, либо убирает подсветку.
     * @param {TopologyIp} ip
     * @param {boolean} highlight
     */
    public highlightNode(ip: TopologyIp, highlight: boolean): void {
        const ips = this.topologyService.graphNode.nodeObject.filter((item: TopologyIp) => item.id === ip.discovered_ip);
        console.log('network', ips.data());
        if (ips.size() === 1) {
            highlight ? this.topologyService.graphNode.nodeHighlight(ips) : this.topologyService.graphNode.removeNodeHighlight(ips);
        }
    }

    /**
     * Находит канал и, исходя из второго параметра "highlight" либо подсвечивает его, либо убирает подсветку.
     * @param {TopologyLink} link
     * @param {boolean} highlight
     */
    public highlightLink(link: TopologyLink, highlight: boolean): void {
        const links = this.topologyService.graphLink.linkObject.filter((item: D3Link) => {
            return item.source.id === link.from_ip && item.target.id === link.to_ip;
        });

        if (links.size() === 1) {
            highlight ? this.topologyService.graphLink.linkHighlight(links) : this.topologyService.graphLink.removeLinkHighlight(links);
        }
    }

    /**
     * Подсветить узел при выборе.
     * @param {TopologyIp} ip
     */
    public selectNode(ip: TopologyIp): void {
        const ips = this.topologyService.graphNode.nodeObject.filter((item: TopologyIp) => item.id === ip.discovered_ip);

        if (ips.size() === 1) {
            this.topologyService.graphNode.selectNode(ips);
        }
    }

    /**
     * Убрать подсветку выбора узла.
     * @param {TopologyIp} ip
     */
    public removeNodeSelect(ip: TopologyIp): void {
        const ips = this.topologyService.graphNode.nodeObject.filter((item: TopologyIp) => item.id === ip.discovered_ip);

        if (ips.size() === 1) {
            this.topologyService.graphNode.removeNodeSelect(ips);
        }
    }

    /**
     * Убрать подсветку выбора со всех узлов.
     */
    public removeNodesSelection(): void {
        this.topologyService.graphNode.removeSelection();
    }

    public removeLink(link: TopologyLink): void {
        const indexToDelete = this.config.links.findIndex(item => item.id === link.id);
        if (indexToDelete !== -1) this.config.links.splice(indexToDelete, 1);
        this.topologyService.graphLink.linkObject.filter((item: D3Link) => {
            return item.source.id === link.from_ip && item.target.id === link.to_ip;
        }).remove();
    }

    ngOnDestroy() {
        this.topologyService.d3.select('div.graph-tooltip').remove();
    }
}
