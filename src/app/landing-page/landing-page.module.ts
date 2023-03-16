import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { LandingPageContainerComponent } from './components/landing-page-container/landing-page-container.component';
import { BrowserModule } from '@angular/platform-browser';
import { AuthModule } from '../auth/auth.module';
import { ModalDialogModule } from 'ngx-modal-dialog';
import { CarouselModule } from 'ngx-owl-carousel-o';



@NgModule({
  declarations: [LandingPageContainerComponent, HeaderComponent, FooterComponent],
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    AuthModule,
    CarouselModule, 
    ModalDialogModule.forRoot(),
  ],
})
export class LandingPageModule { }
