import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { ComponentsModule } from '../../../_components/components.module'
import { BookingPage } from './booking.page';

const routes: Routes = [
  {
    path: '',
    component: BookingPage,
  },
];

@NgModule({
  declarations: [BookingPage],
  entryComponents: [BookingPage],
  imports: [
    CommonModule,
    FormsModule,
    ComponentsModule,
    MarkdownModule.forChild(),
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule],
})
export class BookingModule {}
