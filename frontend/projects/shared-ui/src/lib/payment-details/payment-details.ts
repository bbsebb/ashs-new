import {Component, input, ChangeDetectionStrategy} from '@angular/core';
import {PaymentDetailsViewModel} from '@shared-api';
import {MembershipMini} from '../membership-mini/membership-mini';
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import {MatChipsModule} from '@angular/material/chips';
import {CurrencyPipe, DatePipe} from '@angular/common';
import {StatusPipe} from '../pipes';

@Component({
  selector: 'app-payment-details',
  imports: [
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatChipsModule,
    CurrencyPipe,
    DatePipe,
    MembershipMini,
    StatusPipe
  ],
  templateUrl: './payment-details.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './payment-details.scss',
})
export class PaymentDetails {
  readonly viewModelInputSignal = input.required<PaymentDetailsViewModel>({alias: 'viewModel'});
}
