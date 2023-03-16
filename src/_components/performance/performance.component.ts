import { Component, Input } from "@angular/core";
import { Performance } from '../../app/pages/profile/profile.page'

@Component({
    selector: 'performance-table',
    templateUrl: 'performance.component.html',
    styleUrls: ['performance.component.scss']
})
export class PerformanceTableComponent{
    @Input('team') team: Performance;

    open: boolean = true;
    dOpen: boolean = false;
    tOpen: boolean = true;

    constructor() {
        // console.log('team', this.team)
    }
}