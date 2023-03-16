import { AfterViewChecked, AfterViewInit, Component, Input, OnInit } from "@angular/core";
import { chartData } from "../../app/pages/kompwnd/kompwnd.page";
@Component({
    selector: 'buddy-table',
    templateUrl: 'buddy-table.component.html',
    styleUrls: ['report-table.component.scss']
})
export class BuddyTable implements AfterViewInit{
    @Input('data') buddyData: any[];
    constructor() {
    }


    ngAfterViewInit() {
        console.log('TABLE', this.buddyData);
        
    }
}