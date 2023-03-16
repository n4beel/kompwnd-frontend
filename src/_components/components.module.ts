import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AppHeaderComponent } from './header/header.component';
import { TeamViewerComponent } from './team/team.component';
import { AnalyticsViewerComponent } from './analytics/analytics.component';
import { PerformanceTableComponent } from './performance/performance.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { LoginModal } from './login/login';
import { MatchesPopover } from './matches/matches.popover';
import { HashRateComponent } from './hashrate/hashrate.component';
import { MinerService } from 'src/_services/mine.service';
import {
  ExpandingBoxComponent,
  ExpandingBoxContentComponent,
  ExpandingBoxViewComponent,
} from './expanding-box/expanding-box.component';
import { ReportTable } from './table/report-table.component';
import { SystemService } from 'src/_services/system.service';
import { AuthService } from 'src/_services/auth.service';
import { BuddyTable } from './table/buddy-table.component';
import { Spinner } from './spinner/spinner.component';

const materialModules = [
  MatSlideToggleModule,
  MatMenuModule,
  MatButtonModule,
  MatIconModule,
  MatDialogModule,
  MatInputModule,
  MatSnackBarModule,
];

@NgModule({
  declarations: [
    AppHeaderComponent,
    TeamViewerComponent,
    AnalyticsViewerComponent,
    PerformanceTableComponent,
    HashRateComponent,
    ExpandingBoxComponent,
    ExpandingBoxContentComponent,
    ExpandingBoxViewComponent,
    ReportTable,
    BuddyTable,
    LoginModal,
    MatchesPopover,
    Spinner,
  ],
  entryComponents: [LoginModal, MatchesPopover],
  imports: [CommonModule, FormsModule, RouterModule, ...materialModules],
  providers: [MinerService, SystemService, AuthService],
  exports: [
    AppHeaderComponent,
    TeamViewerComponent,
    AnalyticsViewerComponent,
    PerformanceTableComponent,
    HashRateComponent,
    ExpandingBoxComponent,
    ExpandingBoxContentComponent,
    ExpandingBoxViewComponent,
    ReportTable,
    BuddyTable,
    MatchesPopover,
    Spinner,
    ...materialModules,
  ],
})
export class ComponentsModule {}
