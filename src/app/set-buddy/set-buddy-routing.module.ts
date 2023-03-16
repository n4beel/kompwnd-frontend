import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SetBuddyContainerComponent } from './components/set-buddy-container/set-buddy-container.component';



const routes: Routes = [
  {
    path: '',
    component: SetBuddyContainerComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SetBuddyRoutingModule {}
