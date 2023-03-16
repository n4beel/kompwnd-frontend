import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DashboardHeaderComponent } from './components/dashboard-header/dashboard-header.component';
import { DashboardContainerComponent } from './components/dashboard-container/dashboard-container.component';

import { DashboardRoutingModule } from './dashboard-routing.module';

import { AuthGuard } from '../core/guards/auth.guard';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [DashboardContainerComponent, DashboardHeaderComponent, DashboardComponent],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    SharedModule,
    DashboardRoutingModule,
    ReactiveFormsModule,
  ],
  providers: [
    AuthGuard
  ]
})
export class DashboardModule { }
