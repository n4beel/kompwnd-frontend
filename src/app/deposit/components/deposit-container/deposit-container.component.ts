import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { of, Subject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { Globals } from 'src/app/core/globals';
import { AuthService } from 'src/app/services/auth.service';
import { ConversionService } from 'src/app/services/conversion.service';
import { EosService } from 'src/app/services/eos.service';
import { NotificationService } from 'src/app/services/notification.service';
import { ProfileService } from 'src/app/services/profile.service';
import { ValidateMnemonicComponent } from 'src/app/shared/components/validate-mnemonic/validate-mnemonic.component';

@Component({
  selector: 'app-deposit-container',
  templateUrl: './deposit-container.component.html',
  styleUrls: ['./deposit-container.component.scss']
})
export class DepositContainerComponent implements OnInit {
  message: string;
  messageType: 'error' | 'success';
  messageTimout: NodeJS.Timeout;

  depositDisable = false;
  buddy = '';
  kpwDeposit: number;
  usdDeposit: number
  showError = false;
  formSubmitted: boolean;
  errorHeading: string;
  errorMessage: string;
  currencyImageList = [
    {image: 'aed.svg', symbol: 'AED'},
    {image: 'us.svg', symbol: 'USD'},
    {image: 'india.svg', symbol: 'INR'},
    {image: 'ala.svg', symbol: 'ALA'},
    {image: 'opn.svg', symbol: 'OPN'},
    {image: 'eth.svg', symbol: 'ETH'},
    {image: 'bnb.svg', symbol: 'BNB'},
    {image: 'btc.svg', symbol: 'BTC'},
    {image: 'usdt.svg', symbol: 'USDT'},
    {image: 'sol.svg', symbol: 'SOL'},
    {image: 'trx.svg', symbol: 'TRX'},
    {image: 'matic.svg', symbol: 'MATIC'},
    {image:'euro.png', symbol: 'EUR'},
    {image:'gbt.png', symbol: 'GBP'},
    {image:'pak.png', symbol: 'PKR'}

  ]


  public input$ = new Subject<string>();
  currencyList = [];
  selectedIndex = -1;
  selectedCurrency;
  kpwAvailable: any;
  activePrivateKey = '';


  constructor(private eos: EosService,
    private auth: AuthService,
    private globals: Globals,
    private notificationService: NotificationService,
    private conversion: ConversionService,
    private spinner: NgxSpinnerService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<ValidateMnemonicComponent>,
    private profile: ProfileService) { }

  ngOnInit(): void {
    this.notificationService.notification.subscribe(notification => {
      if (notification.title === 'Deposit Successful') {
        this.showMessage('You have successfully made a deposit in a kompwnd contract')
      }
    });
    this.spinner.show();
    this.getBuddy();
    this.getCurrencies();
    this.input$.pipe(
      debounceTime(250),
      switchMap(input => this.convertToKPW(input)
      )
    ).subscribe();
  }



  async convertToKPW(usdValue) {
    // let ethConversion = this.currencyList.find(currency => currency.symbol === 'ETH')
    // let eth = (ethConversion.price * usdValue) / 2
    // let kpw = await this.conversion.ethToKpw(eth);
    // if (kpw) {
    //   this.kpwDeposit = +kpw * 2;
    // } else {
    //   this.kpwDeposit = 0
    // }
    let kpw = await this.conversion.usdToKpw(usdValue);
    if (kpw) {
      this.kpwDeposit = +kpw;
    } else {
      this.kpwDeposit = 0
    }
  }

  onSelect(index, currency) {
    this.selectedCurrency = currency
    console.log(this.selectedCurrency)
    this.selectedIndex = index;
  }


  getCurrencies() {
    this.profile.getCurrencies('/token/getCurrencies').then((res: any) => {
      console.log(res)
      if (res) {
        this.currencyList = res.map((m) => {
          return {
            ...m,
            image: this.currencyImageList.find(currency => currency.symbol === m.symbol)?.image,
          };
        })
        this.onSelect(0, this.currencyList[0])
      }
      this.spinner.hide();
    });
  }

  getBuddy() {
    this.profile.getBuddy('/user/buddy').then((res: any) => {
      if (res && res.buddy) {
        this.buddy = res.buddy
      }
      this.spinner.hide();
    });
  }

  async openDialog() {
    this.showError = false;
    this.formSubmitted = true;
    this.depositDisable = true;
    if (!this.usdDeposit || this.usdDeposit <= 0) {
      return;
    }

    if (this.buddy == null) {
      this.showError = true;
      this.errorHeading = 'User does not exist'
      this.errorMessage = 'If you cant find a buddy you can use kompwnd as your buddy to support the network';
      this.depositDisable = false;
      return;
    }

    await this.convertToKPW(this.usdDeposit)
    if (!this.selectedCurrency.contract) {
      this.showError = true;
      this.errorHeading = 'Insufficient funds'
      this.errorMessage = 'Upload sufficient funds in your wallet to proceed.';
      this.depositDisable = false;
      return;
    }

    this.dialogRef = this.dialog.open(ValidateMnemonicComponent);
    this.dialogRef.componentInstance.enableButton.subscribe(result => {
      if (result) {
        this.depositDisable = false;
      }
    });
    this.dialogRef.componentInstance.accountValidated.subscribe(result => {
      if (result) {
        this.activePrivateKey = result;
        this.eos.initialize(this.activePrivateKey);
        this.dialogRef.close();
        setTimeout(() => {
          this.onDeposit();
        }, 100)
      }
      console.log('Got the data!', result);
    });
  }

  async onDeposit() {
    let fee = 0;
    let totalDeposit = this.usdDeposit*this.selectedCurrency.price
    if (this.selectedCurrency.fee) {
      fee = totalDeposit * this.selectedCurrency.fee_percentage
      if (fee < this.selectedCurrency.min_fee) {
        fee = this.selectedCurrency.min_fee
      }
      if (fee > this.selectedCurrency.max_fee) {
        fee = this.selectedCurrency.max_fee
      }
    }
    this.spinner.show();
    const quantity  = (totalDeposit + fee).toFixed(this.selectedCurrency.decimals) + ` ${this.selectedCurrency.token}`
    console.log(quantity)
    const Kpw = Number(this.kpwDeposit).toFixed(4);
    const memo = (totalDeposit).toFixed(this.selectedCurrency.decimals) + ',' + Kpw
    this.eos
      .pushTransaction(
        'transfer',
        this.globals.userName,
        {
          from: this.globals.userName,
          to: 'kompwnd',
          quantity,
          memo: memo,
        },
        this.selectedCurrency.contract
      )
      .then((data: any) => {
        if (data.transaction_id) {
          this.getBuddy()
          this.clearValues();
          // this.showMessage('You have successfully made a deposit in a kompwnd contract')
        } else {
          console.log(data);
          data = JSON.parse(data);
          this.showError = true;
          this.errorHeading = 'Insufficient funds'
          this.errorMessage = 'Upload sufficient funds in your wallet to proceed.';
          this.depositDisable = false;
        }
        this.spinner.hide();
      });
  }

  clearValues() {
    this.usdDeposit = 0
    this.kpwDeposit = 0
    this.formSubmitted = false;
    this.depositDisable = false;
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
