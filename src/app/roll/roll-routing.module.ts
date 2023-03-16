import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RollContainerComponent } from './components/roll-container/roll-container.component';


const routes: Routes = [
  {
    path: '',
    component: RollContainerComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RollRoutingModule {}
