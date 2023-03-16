import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { Globals } from 'src/app/core/globals';
import { ConversionService } from 'src/app/services/conversion.service';
import { EosService } from 'src/app/services/eos.service';
import { TransactionService } from 'src/app/services/transaction.service';
import { ValidateMnemonicComponent } from 'src/app/shared/components/validate-mnemonic/validate-mnemonic.component';

@Component({
  selector: 'app-roll-container',
  templateUrl: './roll-container.component.html',
  styleUrls: ['./roll-container.component.scss'],
})
export class RollContainerComponent implements OnInit {
  message = '';
  messageTimout: NodeJS.Timeout;

  usdConversionValue = 0;
  rewardDetail = null;
  showError = false;
  errorMessage = '';
  formsubmitted = false;
  activePrivateKey = '';
  constructor(
    private transactionService: TransactionService,
    private conversionService: ConversionService,
    private spinner: NgxSpinnerService,
    private eos: EosService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<ValidateMnemonicComponent>,
    private globals: Globals
  ) {}

  async ngOnInit() {
    this.spinner.show();
    await this.getUsdConversionValue();
    this.getRewardDetail();
  }

  getRewardDetail() {
    this.transactionService.rewardDetail('/reward').then((res: any) => {
      console.log(res);
      if (res && res.status === 200) {
        const totalAmount =
          res.reward.divAmount +
          res.reward.referralBonus +
          res.reward.matchBonus;
        this.rewardDetail = {
          ...res.reward,
          totalAmount: totalAmount,
          platformFee: totalAmount * 0.1,
          netAmount: totalAmount - totalAmount * 0.1,
        };
        this.spinner.hide();
      }
    });
  }

  async getUsdConversionValue() {
    this.usdConversionValue = await this.conversionService.getKPWUsd();
  }

  openDialog() {
    this.showError = false;
    this.formsubmitted = true;
    if (!this.rewardDetail || this.rewardDetail.divAmount < 40) {
      this.errorMessage = 'Amount must be greater than $40';
      this.showError = true;
      return;
    }
    this.dialogRef = this.dialog.open(ValidateMnemonicComponent);
    this.dialogRef.componentInstance.accountValidated.subscribe((result) => {
      if (result) {
        this.activePrivateKey = result;
        this.eos.initialize(this.activePrivateKey);
        this.dialogRef.close();
        setTimeout(() => {
          this.onProceed();
        }, 100);
      }
      console.log('Got the data!', result);
    });
  }

  onProceed() {
    this.spinner.show();
    this.eos
      .pushTransaction(
        'request',
        this.globals.userName,
        { user: this.globals.userName, action: 'roll' },
        'kompwnd'
      )
      .then((data: any) => {
        if (data.transaction_id) {
          this.transactionService
            .roll('/reward/roll')
            .then((res: any) => {
              console.log(res);
              if (res && res.status === 200) {
                this.getRewardDetail();
                this.showMessage('You have successfully Rolled your rewards');
              } else {
                this.errorMessage = res.message;
                this.showError = true;
              }
              this.spinner.hide();
            })
            .catch((res) => {
              console.log(res);
              this.errorMessage = res.error.error;
              this.showError = true;
              this.spinner.hide();
            });
        } else {
          console.log(data);
          this.errorMessage = 'Unable to roll your amount';
          this.showError = true;
          this.spinner.hide();
        }
      });
  }

  showMessage(message: string) {
    this.message = message;
    this.messageTimout = setTimeout(() => {
      this.hideMessage();
    }, 10000);
  }

  hideMessage() {
    this.message = null;
    clearTimeout(this.messageTimout);
  }
}
