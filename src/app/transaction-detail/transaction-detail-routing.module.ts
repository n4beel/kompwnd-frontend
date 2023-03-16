import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BonusDetailComponent } from './components/bonus-detail/bonus-detail.component';
import { DepositDetailComponent } from './components/deposit-detail/deposit-detail.component';
import { DividendDetailComponent } from './components/dividend-detail/dividend-detail.component';
import { ReferralDetailComponent } from './components/referral-detail/referral-detail.component';
import { WithdrawnDetailComponent } from './components/withdrawn-detail/withdrawn-detail.component';


const routes: Routes = [
  {
    path: 'dividend',
    component: DividendDetailComponent,
  },
  {
    path: 'deposit',
    component: DepositDetailComponent,
  },
  {
    path: 'withdrawn',
    component: WithdrawnDetailComponent,
  },
  {
    path: 'referral',
    component: ReferralDetailComponent,
  },
  {
    path: 'bonus',
    component: BonusDetailComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransactionDetailRoutingModule {}
