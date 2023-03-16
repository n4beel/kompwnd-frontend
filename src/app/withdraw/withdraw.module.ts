import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { WithdrawContainerComponent } from './components/withdraw-container/withdraw-container.component';

import { WithdrawRoutingModule } from './withdraw-routing.module';


@NgModule({
  declarations: [WithdrawContainerComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    WithdrawRoutingModule
  ]
})
export class WithdrawModule { }
