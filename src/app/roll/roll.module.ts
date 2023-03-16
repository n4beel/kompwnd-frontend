import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { RollContainerComponent } from './components/roll-container/roll-container.component';

import { RollRoutingModule } from './roll-routing.module';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [RollContainerComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    RollRoutingModule,
    SharedModule
  ]
})
export class RollModule { }
