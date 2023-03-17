import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Globals } from 'src/app/core/globals';

import { AuthService } from 'src/app/services/auth.service';
import { TeamViewerService } from '../../team-viewer.service';

@Component({
  selector: 'app-team-structure',
  templateUrl: './team-structure.component.html',
  styleUrls: ['./team-structure.component.scss']
})
export class TeamStructureComponent implements OnInit {
  @Input() showConnectedUserTeam = false
  team: any;
  teamAnalytics: any;
  currentDate = new Date()


  responseRecieved: boolean = false;
  showLoader: boolean = false;
  reportSearchFilterForm: FormGroup = new FormGroup({
    username: new FormControl('', Validators.required),
    dateRange: new FormControl(''),
    limit: new FormControl(''),
  });
  errorHeading = '';
  errorMessage = '';
  showError = false;
  constructor(
    private teamViewerService: TeamViewerService,
    private globals: Globals
  ) {
    this.currentDate = new Date()
  }

  ngOnInit(): void {
    if (this.showConnectedUserTeam) {
      this.reportSearchFilterForm.patchValue({
        username: this.globals.userName
      })
      this.onGetTeam()
    }
  }

  onGetTeam() {
    this.showError = false;
    this.team = null;
    this.showLoader = true;
    this.reportSearchFilterForm.markAllAsTouched();
    if (this.reportSearchFilterForm.invalid) {
      this.showLoader = false;
      return;
    }
    this.getTeam(this.reportSearchFilterForm.value)
  }

  getTeam(value) {
    this.responseRecieved = false;
    this.teamViewerService.getTeams(value)
      .then((res: any) => {
        this.responseRecieved = true;
        this.showLoader = false;
        if (res) {
          const team = Object.assign({},
            {
              name: res.name,
              cssClass: res.highlight ? 'oc-background' : '',
              childs: this.appendCssFile(res.childs)
            }
          )
          this.team = [team]
        }
      }).catch((error) => {
        console.log(error)
        this.showError = true;
        this.errorHeading = 'Error'
        this.errorMessage = 'User does not exist.';
        this.showLoader = false;
      });
  }
  appendCssFile(childs) {
    return childs.map((m) => {
      return {
        name: m.name,
        cssClass: m.highlight ? 'oc-background': '',
        childs: this.appendCssFile(m.childs)
    };
    })
  }

}
