import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DepositContainerComponent } from './components/deposit-container/deposit-container.component';


const routes: Routes = [
  {
    path: '',
    component: DepositContainerComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DepositRoutingModule {}
