import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TeamViewerContainerComponent } from './components/team-viewer-container/team-viewer-container.component';


const routes: Routes = [
  {
    path: '',
    component: TeamViewerContainerComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeamViewerRoutingModule {}
