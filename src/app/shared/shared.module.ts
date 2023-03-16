import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreventDoubleClickDirective } from './directives/throttle-click.directive';
import { ValidateMnemonicComponent } from './components/validate-mnemonic/validate-mnemonic.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxFormErrorModule } from 'ngx-form-error';



@NgModule({
  declarations: [PreventDoubleClickDirective, ValidateMnemonicComponent],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgxFormErrorModule,
  ],
  exports:[PreventDoubleClickDirective, ValidateMnemonicComponent],
  entryComponents: [
    ValidateMnemonicComponent  ]
})
export class SharedModule { }
