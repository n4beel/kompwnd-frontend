import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  clientSecret: string;

  constructor() { }
}
