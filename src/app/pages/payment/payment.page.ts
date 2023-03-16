import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { StripeService } from 'src/_services/stripe.service';

import { environment } from '../../../environments/environment';
const { stripeKey } = environment;
const stripe   = Stripe(stripeKey);

@Component({
  selector: 'payment-page',
  templateUrl: 'payment.page.html',
  styleUrls: ['payment.page.scss'],
})
export class PaymentPage implements OnDestroy, AfterViewInit {
  @ViewChild('cardInfo') cardInfo: ElementRef = {} as ElementRef;

  _totalAmount: number;
  card: any;
  cardHandler = this.onChange.bind(this);
  cardError: string = '';
  elements: any;

  loading: boolean = false;

  constructor(
    private cd: ChangeDetectorRef,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogref: MatDialogRef<PaymentPage>,
    private stripeService: StripeService
  ) {
    this._totalAmount = data['totalAmount'];
  }

  ngOnDestroy() {
    if (this.card) {
      // We remove event listener here to keep memory clean
      this.card.removeEventListener('change', this.cardHandler);
      this.card.destroy();
    }
  }

  ngAfterViewInit() {
    this.initiateCardElement();
  }

  initiateCardElement() {
    const cardStyle = {
      base: {
        iconColor: '#c4f0ff',
        color: '#fff',
        fontFamily: 'Roboto, "Helvetica Neue", sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#ffffff',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    };

    // const clientSecret = this.stripeService.clientSecret;
    const option = {
      clientSecret: this.stripeService.clientSecret
    }
    // @ts-ignore 
    this.elements = stripe.elements(option);

    const paymentElement = this.elements.create('payment');
    paymentElement.mount('#payment-element');
  }

  onChange(error: any) {
    if (error.error) {
      this.cardError = error.error.message;
    } else {
      this.cardError = null;
    }
    this.cd.detectChanges();
  }

  onSuccess(token) {
    this.dialogref.close({ token });
  }

  onError(error: any) {
    if (error.message) {
      this.cardError = error.message;
    }
  }

  async onSubmit() {
    this.loading = true;

    // @ts-ignore 
    const { error } = await stripe.confirmPayment({
      elements: this.elements,
      redirect: 'if_required',
    });
    // const nameInput = document.querySelector('#name');
    // const { error } = await stripe.confirmCardPayment(
    //   this.stripeService.clientSecret,
    //   {
    //     payment_method: {
    //       card: this.card,
    //       billing_details: {
    //         name: nameInput['value'],
    //       },
    //     },
    //   }
    // );

    if (!error) {
      this.loading = false;
      this.router.navigate(['/thanks']);
    } else {
      this.loading = false;
      this.onError(error);
    }
  }

  onCancel() {
    this.router.navigate(['/cancel']);
  }
}
