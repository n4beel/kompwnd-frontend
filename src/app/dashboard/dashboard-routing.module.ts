import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../core/guards/auth.guard';

import { DashboardContainerComponent } from './components/dashboard-container/dashboard-container.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: DashboardComponent
      },
      {
        path: 'team-viewer',
        loadChildren: () =>
        import('./../team-viewer/team-viewer.module').then((m) => m.TeamViewerModule),
      },
      {
        path: 'deposit',
        loadChildren: () =>
        import('./../deposit/deposit.module').then((m) => m.DepositModule),
      },
      {
        path: 'withdraw',
        loadChildren: () =>
        import('./../withdraw/withdraw.module').then((m) => m.WithdrawModule),
      },
      {
        path: 'set-buddy',
        loadChildren: () =>
        import('./../set-buddy/set-buddy.module').then((m) => m.SetBuddyModule),
      },
      {
        path: 'roll',
        loadChildren: () =>
        import('./../roll/roll.module').then((m) => m.RollModule),
      },
      {
        path: 'detail',
        loadChildren: () =>
        import('./../transaction-detail/transaction-detail.module').then((m) => m.TransactionDetailModule),
      },
    ],
    component: DashboardContainerComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
