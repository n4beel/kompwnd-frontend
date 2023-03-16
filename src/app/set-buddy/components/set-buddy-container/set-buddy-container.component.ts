import { Component, OnInit } from '@angular/core';

import { ProfileService } from 'src/app/services/profile.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from 'src/app/services/auth.service';
import { SystemService } from 'src/app/services/system.service';
import { environment } from 'src/environments/environment';
import { Globals } from 'src/app/core/globals';
import { EosService } from 'src/app/services/eos.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ValidateMnemonicComponent } from 'src/app/shared/components/validate-mnemonic/validate-mnemonic.component';

@Component({
  selector: 'app-set-buddy-container',
  templateUrl: './set-buddy-container.component.html',
  styleUrls: ['./set-buddy-container.component.scss']
})
export class SetBuddyContainerComponent implements OnInit {
  message: string;
  messageTimout: NodeJS.Timeout;

  buddy = '';
  buddyInvalid = false;
  buddyNotFound = false;
  disableField = false;
  alertMessage = '';
  activePrivateKey = '';

  constructor(
    private profile: ProfileService,
    private spinner: NgxSpinnerService,
    private globals: Globals,
    private eos: EosService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<ValidateMnemonicComponent>,
    private system: SystemService,
  ) { }

  ngOnInit(): void {
    this.spinner.show();
    this.getBuddy();
  }

  getBuddy() {
    this.profile.getBuddy('/user/buddy').then((res: any) => {
      this.spinner.hide();
      let referralBuddy = localStorage.getItem('referral');
      if (res && res.buddy) {
        this.buddy = res.buddy
        if (referralBuddy) {
          this.showAlertMessage('Buddy already exists')
        }
        this.disableField = true;
      } else if (referralBuddy) {
        this.buddy = referralBuddy
      }
    });
  }

  openDialog() {
    if (this.disableField) {
      return;
    }
    this.buddyInvalid = false;
    this.buddyNotFound = false;
    if (this.buddy == null || this.buddy == '') {
      this.buddyInvalid = true
      return;
    }

    this.dialogRef = this.dialog.open(ValidateMnemonicComponent);
    this.dialogRef.componentInstance.accountValidated.subscribe(result => {
      if (result) {
        this.activePrivateKey = result;
        this.eos.initialize(this.activePrivateKey);
        this.dialogRef.close();
        setTimeout(() => {
          this.onSetBuddy();
        }, 100)
      }
      console.log('Got the data!', result);
    });
  }

  onSetBuddy() {
    this.spinner.show();
    this.eos
      .pushTransaction(
        'requestbuddy',
        this.globals.userName,
        { user: this.globals.userName, buddy: this.buddy },
        'kompwnd'
      )
      .then((data: any) => {
        if (data.transaction_id) {
          this.profile.addBuddy('/user/buddy', {
            buddy: this.buddy,
          }).then((res: any) => {
            console.log(res)
            if (res && res?.status === 200) {
              this.disableField = true;
              this.showMessage('You are sucessfully added in a kompwnd network')
            } else {
              this.buddyNotFound = true;
              this.buddy = null;
            }
            this.spinner.hide();
          }).catch((res) => {
            console.log(res)
            this.buddyNotFound = true
            this.spinner.hide();
          });
        } else {
          console.log(data)
          this.buddyNotFound = true
          this.spinner.hide();
        }
      })

  }

  onCopy() {
    this.system.copyTextToClipboard(
      `${environment.landingPageEndPoint}?referral=${this.globals.userName}`
    );
  }



  showMessage(message: string) {
    this.message = message;
    this.messageTimout = setTimeout(() => {
      this.hideMessage();
    }, 5000);
  }

  showAlertMessage(message: string) {
    this.alertMessage = message;
    this.messageTimout = setTimeout(() => {
      this.hideMessage();
    }, 5000);
  }

  hideMessage() {
    this.message = null;
    this.alertMessage = null;
    clearTimeout(this.messageTimout);
  }
}
