import { Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatMenuTrigger } from '@angular/material/menu';
import { AuthService } from 'src/_services/auth.service';
import { environment } from 'src/environments/environment';
import { PaymentPage } from '../payment/payment.page';
import { MatDialog } from '@angular/material/dialog';
import { StripeService } from 'src/_services/stripe.service';
import { Router } from '@angular/router';

@Component({
  selector: 'booking-page',
  templateUrl: 'booking.page.html',
  styleUrls: ['booking.page.scss'],
})
export class BookingPage {
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  email: string;
  emailRegex: RegExp =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  name: string;

  message: string;
  messageType: 'error' | 'success';
  messageTimout: NodeJS.Timeout;

  option: number;
  success: boolean = false;
  loading: boolean = false;

  testProductIds: any = [
    { name: '10 minutes', id: 'prod_KS0F7uIST0HIx7', price: 105 },
    { name: '30 minutes', id: 'prod_KZRUhAsoUYFFJo', price: 262.5 },
    { name: '1 hour', id: 'prod_KZRW4hnKAIQupY', price: 525 },
    { name: '2 hours', id: 'prod_KZRX0MI1AkVMsy', price: 1050 },
  ];

  product: any;

  sendData: any;
  objDateTime: any;
  constructor(
    private auth: AuthService,
    private http: HttpClient,
    private dialog: MatDialog,
    private router: Router,
    private stripeService: StripeService // private formBuilder: FormBuilder
  ) {
    this.getInvoiceNumber();
  }

  async onCheckout() {
    if (!this.auth.user) {
      this.showMessage('Please connect your wallet first.');
    } else if (this.option == null) {
      this.showMessage('Please select a time.');
    } else if (this.name == null || this.name == '') {
      this.showMessage('Name not entered.');
    } else if (this.email == null || this.email == '') {
      this.showMessage('Email not entered.');
    } else if (!this.emailRegex.test(this.email)) {
      this.showMessage('Email not valid.');
    } else {
      await this.getTotal();
      this.createOrder();
    }
  }

  onCryptoCheckout() {
    if (!this.auth.user) {
      this.showMessage('Please connect your wallet first.');
      return false;
    } else if (this.option == null) {
      this.showMessage('Please select a time.');
      return false;
    } else if (this.name == null || this.name == '') {
      this.showMessage('Name not entered.');
      return false;
    } else if (this.email == null || this.email == '') {
      this.showMessage('Email not entered.');
      return false;
    } else if (!this.emailRegex.test(this.email)) {
      this.showMessage('Email not valid.');
      return false;
    } else {
      this.getTotal();
      (<HTMLFormElement>document.getElementById('payCryptoForm')).submit();
      return true;
    }
  }
  createOrder() {
    this.sendData = {
      // token: token,
      product: this.product,
      email: this.email,
      name: this.name,
      username: this.auth.user.username,
      // username: "username",
    };
    console.log('sending ', this.sendData);
    this.http
      .post(environment.endpoint + '/order', this.sendData)
      .toPromise()
      .then((data: any) => {
        if (data.clientSecret) {
          // this.success = true;
          // this.loading = false;
          this.stripeService.clientSecret = data.clientSecret;
          this.router.navigate(['/payment']);
        } else {
          this.showMessage(data.error, true);
        }
        console.log('Received: ', data);
      });
  }

  getInvoiceNumber() {
    const today = new Date();
    const date =
      today.getFullYear() + '' + (today.getMonth() + 1) + '' + today.getDate();
    const time =
      today.getHours() + '' + today.getMinutes() + '' + today.getSeconds();
    this.objDateTime = date + '' + time;
  }
  getTotal() {
    if (this.option == 0) {
      this.product = this.testProductIds[0];
    } else if (this.option == 1) {
      this.product = this.testProductIds[1];
    } else if (this.option == 2) {
      this.product = this.testProductIds[2];
    } else if (this.option == 3) {
      this.product = this.testProductIds[3];
    }

    console.log('product ', this.product);
  }

  priceCalculation(value) {
    this.option = value;
    this.getTotal();
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
}
