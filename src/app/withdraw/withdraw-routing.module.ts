import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WithdrawContainerComponent } from './components/withdraw-container/withdraw-container.component';


const routes: Routes = [
  {
    path: '',
    component: WithdrawContainerComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WithdrawRoutingModule {}
