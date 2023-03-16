import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NgxFormErrorConfig } from 'ngx-form-error';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-validate-mnemonic',
  templateUrl: './validate-mnemonic.component.html',
  styleUrls: ['./validate-mnemonic.component.scss']
})
export class ValidateMnemonicComponent implements OnInit {
  loginForm: FormGroup;
  loginData
  @Output() accountValidated = new EventEmitter<any>();
  @Output() enableButton = new EventEmitter<boolean>();


  title: string;
  alertMessage: string;
  messageTimout: NodeJS.Timeout;
  constructor(
    private formBuilder: FormBuilder,
    private auth: AuthService,
    private dialogRef: MatDialogRef<ValidateMnemonicComponent>,
    private ngxSpinnerService: NgxSpinnerService,
    private errorFormConfig: NgxFormErrorConfig) {
    errorFormConfig.updateMessages({
      required: (context) => `This field is required`,
    });
  }


  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      password: ['', Validators.required]
    });
  }

  onClose() {
    this.enableButton.emit(true);
    this.dialogRef.close();
  }

  onSubmit() {
    this.ngxSpinnerService.show()
    if (this.loginForm.invalid) {
      this.ngxSpinnerService.hide()
      return;
    }
    if (this.loginForm.valid) {
      setTimeout(() => {
        this.loginData = this.loginForm.value;
        this.auth.validateMnemonic(this.loginData.password).then(async (response: any) => {
          if (response) {
            this.accountValidated.emit(response);
          } else {
            this.ngxSpinnerService.hide()
            this.title = 'Error'
            this.alertMessage = 'Password not correct'
          }
        }).catch((err) => {
          this.ngxSpinnerService.hide()
          this.title = 'Error'
          this.alertMessage = 'Password not correct'
          console.log(err);
        })
      }, 100)
    }
  }

  showAlertMessage(title: string, message: string) {
    this.title = title;
    this.alertMessage = message;
    this.messageTimout = setTimeout(() => {
      this.hideMessage();
    }, 5000);
  }

  hideMessage() {
    this.title = null
    this.alertMessage = null;
    clearTimeout(this.messageTimout);
  }
}
