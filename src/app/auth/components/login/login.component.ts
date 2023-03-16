import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ProfileService } from 'src/_services/profile.service';
import { Login } from "../../models/login.model";
import { NgxFormErrorConfig } from 'ngx-form-error';
import { NgxSpinnerService } from 'ngx-spinner';

import { AuthService } from 'src/app/services/auth.service';
import { Globals } from '../../../core/globals'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loginData: Login = new Login();
  showLoader: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private auth: AuthService,
    private dialogRef: MatDialogRef<LoginComponent>,
    private router: Router,
    private ngxSpinnerService: NgxSpinnerService,
    private errorFormConfig: NgxFormErrorConfig,
    private globals: Globals,
    private dialog: MatDialog) {
    errorFormConfig.updateMessages({
      required: (context) => `This field is required`,
    });
  }

  title: string;
  alertMessage: string;
  messageTimout: NodeJS.Timeout;


  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      mnemonicCode: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onClose() {
    this.dialog.closeAll();
  }

  onSubmit() {
    this.ngxSpinnerService.show()

    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid) {
      this.ngxSpinnerService.hide()
      return;
    }
    if (this.loginForm.valid) {
      setTimeout(() => {
        this.loginData = this.loginForm.value;
        this.auth.login(this.loginData.password, this.loginData.mnemonicCode).then(async (response: any) => {
          console.log('account_names', response);
          const userDetails = response
          this.auth.authenticate({
            account_name: userDetails.username,
            fcm_token: this.globals.fcmToken
          }).subscribe(async (res: any) => {
            console.log('hello', res);
            if (res.access_token) {
              this.ngxSpinnerService.hide()

              this.globals.setUserName(res.user.account_name);
              this.globals.setToken(res.access_token);
              this.router.navigate(['/dashboard']);
            }
            this.auth.setUser(response);
            this.dialogRef.close();
          });
        }).catch((err) => {
          this.ngxSpinnerService.hide()
          this.showAlertMessage('Error', err)
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
