import { AfterViewInit, Component, ElementRef, HostListener } from "@angular/core";

@Component({
    selector: 'expanding-box-content',
    templateUrl: 'expanding-box-content.component.html',
    styleUrls: ['expanding-box-content.component.scss']
})
export class ExpandingBoxContentComponent { }

@Component({
    selector: 'expanding-box-view',
    templateUrl: 'expanding-box-view.component.html',
    styleUrls: ['expanding-box-view.component.scss']
})
export class ExpandingBoxViewComponent { }

@Component({
    selector: 'expanding-box',
    templateUrl: 'expanding-box.component.html',
    styleUrls: ['expanding-box.component.scss']
})
export class ExpandingBoxComponent implements AfterViewInit {
    expanded: boolean = false;
    content: HTMLElement;
    view: HTMLElement;

    @HostListener('click', ['$event.target']) onClick(self) {
        if(!this.expanded) {
            this.elRef.nativeElement.style.top = this.elRef.nativeElement.offsetTop + 'px';
            this.elRef.nativeElement.style.left = this.elRef.nativeElement.offsetLeft + 'px';
            this.view.classList.add('expanded');
            setTimeout(() => {
                let siblings = this.elRef.nativeElement.parentElement.children;
                for(let sib of siblings) {
                    if(sib != this.elRef.nativeElement) {
                        sib.classList.add('hold');
                    }
                }
                
                this.expanded = true;
                this.elRef.nativeElement.classList.add('expanded');
                this.content.classList.add('animating');
                
                setTimeout(() => {
                    this.content.classList.add('expanded');
                    this.content.classList.remove('animating');
                }, 100);
            }, 100 )
        }
    }

    constructor(private elRef:ElementRef) {
        
    }

    ngAfterViewInit() {
        this.content = this.elRef.nativeElement.querySelector('expanding-box-content');
        this.view = this.elRef.nativeElement.querySelector('expanding-box-view');
    }

    onClose(ev: Event) {
        ev.stopPropagation();
        this.elRef.nativeElement.classList.add('animating');
        this.elRef.nativeElement.classList.remove('expanded');
        this.content.classList.remove('expanded');
        this.expanded = false;

        this.content.classList.add('animating');
        this.content.classList.remove('expanded');
        setTimeout(() => {
            this.content.classList.remove('animating');
            this.view.classList.remove('expanded');
        }, 300);
        
        setTimeout(() => {
            this.elRef.nativeElement.classList.remove('animating');
            for(let sib of this.elRef.nativeElement.parentElement.children) {
                sib.classList.remove('hold');
            }
        }, 300)
    }
}