import {GraphSimulation} from './topology-helpers/graph-simulation/graph-simulation';
import {GraphDragNDrop} from './topology-helpers/graph-drag-n-drop/graph-drag-n-drop';
import {GraphTick} from './topology-helpers/graph-tick/graph-tick';
import {GraphTooltip} from './topology-helpers/graph-tooltip/graph-tooltip';
import {GraphNode} from './topology-helpers/graph-node/graph-node';
import {GraphLink} from './topology-helpers/graph-link/graph-link';

export class GraphConfig {
    public ips?: TopologyIp[];
    public links?: TopologyLink[];
    public width?: number;
    public viewBoxWidth? = 2000;
    public viewBoxHeight? = 750;
    public nodeDiameter? = 48;
    public height?: number;
    public gravityOn? = true;
    public topologyId?: string;
}

export interface TopologyIp {
    discovered_ip: string;
    id?: string;
    index?: number;
    x?: number;
    y?: number;
    vx?: number;
    vy?: number;
    fx?: number;
    fy?: number;
    host?: TopologyHost;
    interfaces?: TopologyIp[];
    isNetworkDevice?: boolean;
    networkStatus?: {
        code: 'online' | 'offline' | 'unknown';
    }
}

export interface TopologyLink {
    id: string;
    from_ip?: string;
    to_ip?: string;
    source: string | TopologyIp;
    target: string | TopologyIp;
    position?: 'primary' | 'secondary' | 'single';
    status?: {
        code: 'online' | 'offline' | 'unknown' | 'network',
        name: string
    }
}

export interface D3Link {
    id: string;
    from_ip?: string;
    to_ip?: string;
    source: TopologyIp;
    target: TopologyIp;
    position?: 'primary' | 'secondary' | 'single';
    status?: {
        code: 'online' | 'offline' | 'unknown' | 'network',
        name: string
    };
}

export class GraphObject {
    public simulation: GraphSimulation = null;
    public dragndrop: GraphDragNDrop = null;
    public tick: GraphTick = null;
    public tooltip: GraphTooltip = null;
    public node: GraphNode = null;
    public link: GraphLink = null;
}

export interface TopologyHost {
    id: string;
    name: string;
    description: string;
    host_ip: string;
    host_type?: TopologyHostType;
    host_type_id: string;
    is_online?: boolean;
    additions: string;
    coords: string;
    mac_address: string;
    os_info: string;
    status?: { code: 'online' | 'offline' | 'unknown', name: string };
    latitude?: string;
    longitude?: string;
    address?: string;
    host_dns?: string;
    gis_id?: string;
    communication_center_id?: string;
}

export interface TopologyHostType {
    code: string;
    id: string;
    name: string;
    template_id: string;
}

export interface LocalTopology {
    id: string;
    gravity: boolean;
    ips: LocalTopologyNode[];
}

export interface LocalTopologyNode {
    ip: string;
    x: number;
    y: number;
}
