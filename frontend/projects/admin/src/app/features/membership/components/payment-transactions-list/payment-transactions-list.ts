import {Component, input, output} from '@angular/core';
import {CampaignPaymentsViewModel, PaymentDetailsViewModel} from '@shared-api';
import {UUID} from '@shared-domain';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import {CurrencyPipe} from '@angular/common';

@Component({
  selector: 'app-payment-transactions-list',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    CurrencyPipe
  ],
  templateUrl: './payment-transactions-list.html',
  styleUrl: './payment-transactions-list.scss'
})
export class PaymentTransactionsList {
  readonly viewModelInputSignal = input.required<CampaignPaymentsViewModel>({alias: 'viewModel'});

  readonly processMembershipOutput = output<UUID>({alias: 'processMembership'});

  protected readonly columnsToDisplay = ['payerName', 'payerEmail', 'amount', 'status', 'actions'];
  protected expandedElement: PaymentDetailsViewModel | null = null;

  protected toggleRow(element: PaymentDetailsViewModel): void {
    this.expandedElement = this.expandedElement === element ? null : element;
  }

  protected onProcess(membershipId: string, event: Event): void {
    event.stopPropagation();
    this.processMembershipOutput.emit(membershipId);
  }
}
