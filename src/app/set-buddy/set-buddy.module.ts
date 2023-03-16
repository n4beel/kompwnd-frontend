import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SetBuddyContainerComponent } from './components/set-buddy-container/set-buddy-container.component';

import { SetBuddyRoutingModule } from './set-buddy-routing.module';
import { SharedModule } from '../shared/shared.module';



@NgModule({
  declarations: [SetBuddyContainerComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    SetBuddyRoutingModule,
    SharedModule
  ]
})
export class SetBuddyModule { }
