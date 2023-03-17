import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TeamViewerContainerComponent } from './components/team-viewer-container/team-viewer-container.component';

import { TeamViewerRoutingModule } from './team-viewer-routing.module';
import { ReportingComponent } from './components/reporting/reporting.component';
import { TeamStructureComponent } from './components/team-structure/team-structure.component';
import { EosService } from '../services/eos.service';
import { AuthService } from '../services/auth.service';
// import { GaiaService } from '../services/gaia.service';
import { SystemService } from '../services/system.service';
// import { MinerService } from '../services/mine.service';
import { ConversionService } from '../services/conversion.service';
// import { SocketService } from '../services/socket.service';
// import { StripeService } from '../services/stripe.service';
import { NgxFormErrorModule } from 'ngx-form-error';
import { TeamViewerService } from './team-viewer.service';
// import {MatNativeDateModule} from '@angular/material/core';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from '@danielmoncada/angular-datetime-picker';
import { SharedModule } from '../shared/shared.module';
import { NgxOrgChartModule } from 'ngx-org-chart';
@NgModule({
  declarations: [TeamViewerContainerComponent, ReportingComponent, TeamStructureComponent],
  imports: [
    CommonModule,
    NgxOrgChartModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    TeamViewerRoutingModule,
    NgxFormErrorModule,
    OwlDateTimeModule, 
    OwlNativeDateTimeModule,
    SharedModule
  ],
  providers:[
    AuthService,
    EosService,
    SystemService,
    ConversionService,
    TeamViewerService
  ]
})
export class TeamViewerModule { }
