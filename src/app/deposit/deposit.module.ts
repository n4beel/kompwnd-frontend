import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DepositContainerComponent } from './components/deposit-container/deposit-container.component';

import { DepositRoutingModule } from './deposit-routing.module';
import { DigitDotOnlyDirective } from '../core/directives/digit-dot-only.directive';
import { PrecisionPipe } from './pipes/precision.pipe';
import { SharedModule } from '../shared/shared.module';



@NgModule({
    declarations: [DepositContainerComponent, 
      PrecisionPipe,
      DigitDotOnlyDirective, ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    DepositRoutingModule,
    SharedModule
  ]
})
export class DepositModule { }
