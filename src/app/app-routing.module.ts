import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TokenGuard } from './core/guards/token.guard';

import { LandingPageContainerComponent } from './landing-page/components/landing-page-container/landing-page-container.component';

const routes: Routes = [
   {
    path: '',
    component: LandingPageContainerComponent,
    canActivate: [TokenGuard]
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
  },
  // {
  //   path: '',
  //   redirectTo: 'kompwnd',
  //   pathMatch: 'full',
  // },
  {
    path: 'kompwnd',
    loadChildren: () =>
      import('./pages/kompwnd/kompwnd.module').then((m) => m.KompwndPageModule),
  },
  {
    path: 'kpw-swap',
    loadChildren: () =>
      import('./pages/swap/KPWswap.module').then((m) => m.KPWSwapPageModule),
  },
  {
    path: 'lookup',
    loadChildren: () =>
      import('./pages/lookup/lookup.module').then((m) => m.LookupPageModule),
  },
  {
    path: 'airdrops',
    loadChildren: () =>
      import('./pages/airdrops/airdrops.module').then((m) => m.AirdropsPageModule),
  },
  {
    path: 'teamviewer',
    loadChildren: () =>
      import('./pages/team-viewer/team-viewer.module').then((m) => m.TeamViewerPageModule),
  },
  {
    path: 'mine',
    loadChildren: () =>
      import('./pages/mine/mine.module').then((m) => m.MinePageModule),
  },
  {
    path: 'how',
    loadChildren: () =>
      import('./pages/how/how.module').then((m) => m.HowItWorksModule),
  },
  {
    path: 'booking',
    loadChildren: () =>
      import('./pages/booking/booking.module').then((m) => m.BookingModule),
  },
  {
    path: 'profile/:user',
    loadChildren: () => 
      import('./pages/profile/profile.module').then((m) => m.ProfileModule)
  },
  {
    path: 'adil',
    loadChildren: () =>
      import('./pages/adil-abbas/adil-abbas.module').then((m) => m.AdilAbbasModule),
  },
  {
    path: 'payment',
    loadChildren: () =>
      import('./pages/payment/payment.module').then((m) => m.PaymentModule),
  },
  {
    path: 'thanks',
    loadChildren: () =>
      import('./pages/thanks/thanks.module').then((m) => m.ThanksModule),
  },
  {
    path: 'cancel',
    loadChildren: () =>
      import('./pages/cancel/cancel.module').then((m) => m.CancelModule),
  },
  {
    path: 'checkout/:amount',
    loadChildren: () =>
      import('./pages/checkout/checkout.module').then((m) => m.CheckoutModule),
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
