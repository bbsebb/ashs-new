import {Component, input} from '@angular/core';
import {MembershipDetailsViewModel} from '@shared-api';
import {MatCardModule} from '@angular/material/card';
import {MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {CurrencyPipe} from '@angular/common';
import {StatusPipe} from '../pipes';

@Component({
  selector: 'app-membership-details',
  imports: [MatCardModule, MatChipsModule, MatIconModule, MatDividerModule, CurrencyPipe, StatusPipe],
  templateUrl: './membership-details.html',
  styleUrl: './membership-details.scss',
})
export class MembershipDetails {
  readonly viewModelInputSignal = input.required<MembershipDetailsViewModel>({alias: 'viewModel'});
}
