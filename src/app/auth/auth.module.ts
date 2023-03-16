import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { LoginComponent } from './components/login/login.component';

import { NgxFormErrorModule } from 'ngx-form-error';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [LoginComponent],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgxFormErrorModule,
    SharedModule
  ],
  providers:[],
  entryComponents: [
    LoginComponent 
  ]
})
export class AuthModule { }
