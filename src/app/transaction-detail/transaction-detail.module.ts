import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';

import { BonusDetailComponent } from './components/bonus-detail/bonus-detail.component';
import { DepositDetailComponent } from './components/deposit-detail/deposit-detail.component';
import { ReferralDetailComponent } from './components/referral-detail/referral-detail.component';
import { DividendDetailComponent } from './components/dividend-detail/dividend-detail.component';
import { DetailContainerComponent } from './components/detail-container/detail-container.component';
import { WithdrawnDetailComponent } from './components/withdrawn-detail/withdrawn-detail.component';

import { TransactionDetailRoutingModule } from './transaction-detail-routing.module';


@NgModule({
  declarations: [DetailContainerComponent, DividendDetailComponent, DepositDetailComponent, WithdrawnDetailComponent, ReferralDetailComponent, BonusDetailComponent],
  imports: [
    RouterModule,
    CommonModule,
    TransactionDetailRoutingModule,
  ]
})
export class TransactionDetailModule { }
