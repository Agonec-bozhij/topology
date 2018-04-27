import {Component, ElementRef, OnDestroy} from '@angular/core';
import {TopologyComponent} from './topology/topology.component';
import {Subject} from 'rxjs/Subject';
import {D3Link, TopologyIp, TopologyLink} from './topology/topology.models';
import {HttpClient} from '@angular/common/http';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {

    private _unsubscribe: Subject<void> = new Subject<void>();
    private topologyComponent: TopologyComponent;

    public get topologyConfig() {
        return this.topologyComponent && this.topologyComponent.config ? this.topologyComponent.config : false;
    }

    constructor(private el: ElementRef, private http: HttpClient) {

    }

    public topologyComponentLoaded(topologyComponent) {

        this.topologyComponent = topologyComponent;

        const ips: TopologyIp[] = [], links: TopologyLink[] = [];
        this.http.get('/assets/data/mock.json')
            .subscribe((response: { ips: TopologyIp[], links: TopologyLink[] }) => {
                response.ips.forEach((ip) => {
                    const found = ips.find(item => item.id === ip.discovered_ip.trim());
                    if (!found) ips.push({
                        discovered_ip: ip.discovered_ip.trim(),
                        id: ip.discovered_ip.trim(),
                        host: ip.host
                    });
                });

                response.links.forEach((link) => {
                    const ipsCount = ips.filter((item: TopologyIp) => item.id === link.from_ip || item.id === link.to_ip).length;
                    if (ipsCount === 2) {
                        links.push({
                            id: link.id,
                            from_ip: link.from_ip,
                            source: link.from_ip,
                            to_ip: link.to_ip,
                            target: link.to_ip,
                            status: link.status
                        });
                    }
                });
                this.topologyComponent.config = {
                    ips: ips,
                    links: links,
                    width: this.el.nativeElement.clientWidth,
                    height: this.el.nativeElement.clientHeight
                };
            });
    }

    toggleGravity() {
        this.topologyComponent.gravityToggle();
    }

    onNodeDblClick(event: TopologyIp) {

    }

    onLinkDblClick(event: D3Link) {

    }

    onLinkClick(event: D3Link) {

    }

    onNodeClick(ip: TopologyIp) {

    }

    ngOnDestroy() {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }
}
