import {AbstractGraphHelper} from '../abstract-graph-helper';
import {LocalTopology} from '../../topology.models';
import {TopologyService} from '../../topology.service';

export class GraphLocalData extends AbstractGraphHelper {

    private topologies: LocalTopology[] = [];

    public currentTopology: LocalTopology = null;

    constructor(protected topologyService: TopologyService) {
        super();
        this.initialize();
    }

    /**
     * @inheritDoc
     */
    protected initialize(): void {
        const data_for_parse = localStorage.getItem('savedTopologies');
        if (data_for_parse) this.topologies = JSON.parse(data_for_parse);

        this.setTopology(this.config.topologyId);
    }

    /**
     * Изменяет флаг гравитации в текущей сохраненной топологии.
     * Удаляет все сохраненные элементы из топологии.
     * Если гравитация выключилась - сохраняет в локалсторедж позицию всех элементов графа.
     * Сохраняет топологию в локал сторэдже.
     */
    public gravityToggle(): void {
        this.currentTopology.gravity = this.config.gravityOn;
        this.currentTopology.ips = [];

        if (!this.config.gravityOn) {
            this.config.ips.forEach(item => this.currentTopology.ips
                .push({ip: item.discovered_ip, x: Math.round(item.x), y: Math.round(item.y)})
            );
        }

        this.saveTopologies();
    }

    /**
     * Получает IP и координаты элемента, затем сохраняет их в локальных данных.
     * Если не находит такой элемент - добавляет его в локальные данные.
     * @param {string} ip
     * @param {number} x
     * @param {number} y
     */
    public saveOnDrag(ip: string, x: number, y: number): void {
        console.log('save drag');
        const localNode = this.localData.currentTopology.ips.find(node => node.ip === ip);
        if (localNode) {
            localNode.x = x;
            localNode.y = y;
        } else {
            this.localData.currentTopology.ips.push({ip: ip, x: x, y: y});
        }

        this.saveTopologies();
    }

    /**
     * Получает на вход ID топологии и проверяет - есть ли такая топология в сохраненных.
     * Если находит - помещает ее в свойство currentTopology.
     * Если не находит - содает пустую, сохраняет и помещает ее в свойство currentTopology.
     * Затем задает позиции всем элементам графа.
     * @param {string} id
     */
    private setTopology(id: string): void {
        const topology = this.topologies.find((item) => item.id === id);
        if (topology) {
            this.currentTopology = topology;
        } else {
            this.currentTopology = {id: id, gravity: true, ips: []};
            this.topologies.push(this.currentTopology);
            this.saveTopologies();
        }

        this.setNodesPositions();

        this.config.gravityOn = this.currentTopology.gravity;
    }

    /**
     * Задает позиции всех элементов текущей топологии из локальных данных.
     * Если элемента нет в локальных данных - делает рандомную позицию, задает ее и сохраняет в локальных данных.
     */
    private setNodesPositions(): void {
        this.config.ips.map(node => {
            const localNode = this.currentTopology.ips.find( item => item.ip === node.id);

            if (localNode) {
                node.x = localNode.x;
                node.y = localNode.y;
            } else {
                node.x = Math.round(this.config.viewBoxWidth / Math.random());
                node.y = Math.round(this.config.viewBoxHeight / Math.random());
                this.currentTopology.ips.push({ip: node.id, x: node.x, y: node.y});
            }

            return node;
        });

        this.saveTopologies();
    }

    /**
     * Сохраняет все топологии в локал сторэдж.
     */
    private saveTopologies(): void {
        localStorage.setItem('savedTopologies', JSON.stringify(this.topologies));
    }
}
