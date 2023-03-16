import { BrowserModule } from '@angular/platform-browser';
import { NgModule, SecurityContext } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MatIconRegistry } from "@angular/material/icon";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MarkdownModule, MarkedOptions, MarkedRenderer } from 'ngx-markdown';

import { AuthService } from 'src/_services/auth.service';
import { EosService } from 'src/_services/eos.service';
import { GaiaService } from 'src/_services/gaia.service';
import { SystemService } from 'src/_services/system.service';
import { ConversionService } from 'src/_services/conversion.service';
import { SocketService } from 'src/_services/socket.service';
import { StripeService } from 'src/_services/stripe.service';

import { ComponentsModule } from 'src/_components/components.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MinerService } from 'src/_services/mine.service';
import { ModalsModule } from 'src/_modals/modals.module';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LandingPageModule } from './landing-page/landing-page.module';

import { NgxSpinnerModule } from "ngx-spinner";
import { AuthRequestInterceptor } from './core/interceptors/auth.request.interceptor';
import { TokenGuard } from './core/guards/token.guard';
import { environment } from 'src/environments/environment';
import { initializeApp } from "firebase/app";
initializeApp(environment.firebase);

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    ComponentsModule,
    LandingPageModule,
    ModalsModule,
    BrowserModule,
    FormsModule,
    CommonModule,
    NgxChartsModule,
    MarkdownModule.forRoot({
      sanitize: SecurityContext.NONE,
    }),
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    NgbModule,
    MatDialogModule,
    NgxSpinnerModule
  ],
  providers: [
    TokenGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthRequestInterceptor,
      multi: true
    },
    MatIconRegistry,
    AuthService,
    EosService,
    GaiaService,
    SystemService,
    MinerService,
    ConversionService,
    SocketService,
    StripeService,
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
