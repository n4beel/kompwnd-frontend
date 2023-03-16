import { Component, Input, OnInit } from "@angular/core";

@Component({
    selector: 'matches',
    templateUrl: 'matches.popover.html',
    styleUrls: ['matches.popover.scss']
})
export class MatchesPopover implements OnInit {
    @Input('matches') matches: match[];
    constructor() {

    }

    ngOnInit() {
        
    }
}

interface match {
    generation: number;
    user: string;
    value: string;
    dateTime: number;
}