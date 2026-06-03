import {Component, input} from '@angular/core';
import {PaymentDetailsViewModel} from '@shared-api';
import {MembershipMini} from '../membership-mini/membership-mini';
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import {MatChipsModule} from '@angular/material/chips';
import {CurrencyPipe, DatePipe} from '@angular/common';

@Component({
  selector: 'app-payment-details',
  imports: [
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatChipsModule,
    CurrencyPipe,
    DatePipe,
    MembershipMini
  ],
  templateUrl: './payment-details.html',
  styleUrl: './payment-details.scss',
})
export class PaymentDetails {
  readonly viewModelInputSignal = input.required<PaymentDetailsViewModel>({alias: 'viewModel'});
}
