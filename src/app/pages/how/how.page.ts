import { Component, Renderer2, ViewChild } from "@angular/core";
import { MatMenuTrigger } from "@angular/material/menu";
import { NavigationEnd, Router } from "@angular/router";
import { MarkdownComponent, MarkdownService } from "ngx-markdown";
import { filter } from 'rxjs/operators';

const isAbsolute = new RegExp('(?:^[a-z][a-z0-9+.-]*:|\/\/)', 'i');

@Component({
    selector: 'how-to-page',
    templateUrl: 'how.page.html',
    styleUrls: ['how.page.scss']
})
export class HowToPage {
    @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

    @ViewChild('postDiv', {static: false}) private postDiv: MarkdownComponent;
    private listenObj: any;
    
    activePage: SubPage;

    pages: SubPage[] = [
        {
            url: 'itworks',
            filePath: 'howitworks',
            hidden: true,
            label: 'How It Works'
        },
        {
            url: 'kompwnd',
            filePath: 'kompwnd',
            icon: 'kompwnd',
            label: 'Kompwnd'
        },
        {
            url: 'incentives_and_throttling',
            filePath: 'incentives_and_throttling',
            icon: 'kompwnd',
            label: 'Incentives & Throttling',
            children: [
                {
                    url: 'claim_throttle',
                    filePath: 'claimthrottle',
                    icon: 'kompwnd',
                    label: 'Claim Throttling'
                },
                {
                    url: 'deposit_incentive',
                    filePath: 'depositincentive',
                    icon: 'kompwnd',
                    label: 'Deposit Incetive'
                }
            ]
        },
        {
            url: 'claimroll',
            filePath: 'claimroll',
            icon: '',
            label: 'Claim & Roll'
        },
        {
            url: 'teamviewer',
            filePath: 'teamviewer',
            icon: 'team',
            label: 'Team Viewer'
        },
        {
            url: 'airdrops',
            filePath: 'airdrops',
            icon: 'airdrop',
            label: 'Air Drops'
        },
        {
            url: 'swap',
            filePath: 'swap',
            icon: 'swap',
            label: 'KPW Swap'
        },
        {
            url: 'mining',
            filePath: 'mining',
            icon: '',
            label: 'KPW Mining'
        }
    ]

    constructor(
        private router: Router,
        private markdownService: MarkdownService, 
        private renderer: Renderer2
    ) {
        // this.pages = this.pages.map(p => {
        //     p.filePath = 'assets/howto/' + p.filePath + '.md';

        //     return p;
        // });

        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe(async (event: NavigationEnd) => {
            for(let [i, ref] of (await this.getEntries()).entries()) {
                // ref.nativeElement.classList.contains('active')
                if(event.url.includes(ref.url)) {
                    this.loadFile(ref);
                }
            }
        });

        this.getEntries()
    }

    async getEntries(parent?: SubPage) {
        let pages: SubPage[] = parent ? parent.children : this.pages;
        let entryArr: SubPage[] = [];
        for(let page of pages) {
            let obj: SubPage = Object.assign({}, page);
            if(parent) obj.url = parent.url + '/' + page.url;
            entryArr.push(obj);
            if(page.children) {
                let children: SubPage[] = await this.getEntries(page);
                entryArr = entryArr.concat(children);
            }
        }

        return entryArr;
    }

    loadFile(page: SubPage) {
        console.log(page);
        
        this.activePage = page;
    }

    onError(error) {
        console.log(error);
    }

    onLoad(event) {
        console.log(event);
        
    }

    public onMarkdownLoad() {
        // because MarkdownComponent isn't 'compiled' the links don't use the angular router,
        // so I'll catch the link click events here and pass them to the router...
        if (this.postDiv) {
            this.listenObj = this.renderer.listen(this.postDiv.element.nativeElement, 'click', (e: Event) => {
                if (e.target && (e.target as any).tagName === 'A') {
                    const el = (e.target as HTMLElement);
                    const linkURL = el.getAttribute && el.getAttribute('href');
                    if (linkURL && !isAbsolute.test(linkURL)) {
                        e.preventDefault();
                        this.router.navigate([linkURL]);
                    }
                }
            });
        }
    }
}

interface SubPage {
    url: string;
    filePath: string;
    icon?: string;
    hidden?: true;
    label: string;
    children?: SubPage[]
}