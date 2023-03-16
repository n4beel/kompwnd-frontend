import { Component, Input } from "@angular/core";
import { Buddies } from "src/_services/eos.service";

@Component({
    selector: 'team-viewer',
    templateUrl: 'team.component.html',
    styleUrls: ['team.component.scss']
})
export class TeamViewerComponent{
    @Input('team') team: Buddies;
    @Input('deposit') deposit: boolean;

    open: boolean = true;
    dOpen: boolean = false;
    tOpen: boolean = true;

}