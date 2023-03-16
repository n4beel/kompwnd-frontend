import { Component, ViewChild, DoCheck, OnInit } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { AuthService } from 'src/_services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { EosService, Token } from 'src/_services/eos.service';
import { ConversionService } from 'src/_services/conversion.service';
import { Subscription, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from "../../../environments/environment";
const { redirectionUrl, toName } = environment;

@Component({
  selector: 'checkout-page',
  templateUrl: 'checkout.page.html',
  styleUrls: ['checkout.page.scss'],
})
export class CheckoutPage implements DoCheck, OnInit {
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  timerSubscription: Subscription;

  kpwAvailable: Token;
  tokpwDeposit: number;

  fromName: string = this.auth?.user?.username;
  toName: string = toName;
  amount: string = this.route.snapshot.params['amount'];
  kpwValue: Token;
  kpwDisplay: string;

  message: string;
  messageType: 'error' | 'success';
  messageTimout: NodeJS.Timeout;
  priceTimeout: NodeJS.Timeout;

  option: number;
  success: boolean = false;
  loading: boolean = false;
  isPriceUpdated: boolean = false;

  constructor(
    private eos: EosService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private conversion: ConversionService
  ) {
    this.priceConverstion();

    if (this.eos.ready) {
      this.init();
    }
    this.eos.on('eosReady').subscribe(() => {
      this.init();
    });

    if (!this.auth.user) {
      this.showMessage('Please connect your wallet first.');
    }
  }

  async init() {
    if (this.auth.user) {
      this.eos.on('migration').subscribe(() => {
        this.eos
          .getBalance(this.fromName, 'kompwndtoken', 'KPW')
          .then((data: any) => {
            this.kpwAvailable = this.eos.toToken(data.data);
          });
      });

      this.eos
        .getBalance(this.fromName, 'kompwndtoken', 'KPW')
        .then((data: any) => {
          this.kpwAvailable = this.eos.toToken(data.data);
        });
    }
  }

  async onCheckout() {
    if (!this.auth.user) {
      this.showMessage('Please connect your wallet first.');
      return false;
    } else if (this.kpwValue.value > this.kpwAvailable.value) {
      this.showMessage('Insufficient Balance.');
      return false;
    } else {
      this.createCheckout();
      this.loading = true;
    }
  }

  getBalance() {
    this.eos
      .getBalance(this.auth.user.username, 'kompwndtoken', 'KPW')
      .then((data: any) => {
        console.log('Data: ', data);
        this.kpwAvailable = this.eos.toToken(data.data);
      });

    console.log('this.kpwAvailable', this.kpwAvailable);
  }

  async createCheckout() {
    let quantity = Number(this.kpwValue.value).toFixed(4) + ' KPW';
    this.eos
      .pushTransaction(
        'transfer',
        this.fromName,
        {
          from: this.fromName,
          to: this.toName,
          quantity,
          memo: 'Shoppingrite checkout',
        },
        'kompwndtoken'
      )
      .then((data: any) => {
        if (data.transaction_id) {
          this.tokpwDeposit = null;
          this.showMessage('Amount transferred succesful');
          this.init();
          this.eos
            .getBalance(this.fromName, 'kompwndtoken', 'KPW')
            .then((data: any) => {
              this.kpwAvailable = this.eos.toToken(data.data);
              this.loading = false;
            });
          console.log(data.transaction_id);
          window.location.href = `${redirectionUrl+data.transaction_id}`;
        } else {
          data = JSON.parse(data);
          let message = data.error.details[0].message.split(': ').pop();
          this.showMessage('Error: ' + message, true);
          this.loading = false;
        }
      });
  }

  async priceConverstion() {
    let decryptedData = Buffer.from(this.amount, 'base64').toString('ascii');
    const convertedValue = +decryptedData;
    console.log("object", convertedValue);
    this.kpwValue = await this.conversion._usdtokpw(convertedValue);
    this.kpwDisplay = this.kpwValue.value + ' ' + this.kpwValue.symbol;
    this.isPriceUpdated = false;
  }
  showMessage(message: string, error: boolean = false) {
    this.messageType = error ? 'error' : 'success';
    this.message = message;
    this.messageTimout = setTimeout(() => {
      this.hideMessage();
    }, 5000);
  }

  hideMessage() {
    this.message = null;
    clearTimeout(this.messageTimout);
  }

  ngDoCheck() {
    this.fromName = this.auth?.user?.username;
  }

  ngOnInit() {
    this.timerSubscription = timer(0, 30000)
      .pipe(
        map(() => {
          this.priceConverstion();
          this.isPriceUpdated = true;
        })
      )
      .subscribe();
  }
}

// export interface Token {
//   value: number;
//   precision: number;
//   symbol: string;
// }
