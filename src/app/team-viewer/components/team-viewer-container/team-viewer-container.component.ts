import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-team-viewer-container',
  templateUrl: './team-viewer-container.component.html',
  styleUrls: ['./team-viewer-container.component.scss']
})
export class TeamViewerContainerComponent implements OnInit {
  isTeamStructureActive: boolean = false;
  showConnectedUserTeam = false;
  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    if(history.state && history.state.data && history.state.data.showConnectedUserTeam) {
      console.log('Data: ');
      this.showConnectedUserTeam = true;
      this.toggle(true)

    }
  }

  toggle(value: boolean) {
    this.isTeamStructureActive = value;
  }


}
