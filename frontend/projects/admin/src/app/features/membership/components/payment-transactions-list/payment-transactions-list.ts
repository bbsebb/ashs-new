import {Component, computed, input, output, signal} from '@angular/core';
import {CampaignPaymentsViewModel, PaymentDetailsViewModel} from '@shared-api';
import {UUID} from '@shared-domain';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSortModule, Sort} from '@angular/material/sort';
import {RouterLink} from '@angular/router';
import {CurrencyPipe, DatePipe} from '@angular/common';
import {StatusPipe} from '@shared-ui';

export interface MembershipRowViewModel {
  id: string;
  firstName: string;
  lastName: string;
  categoryName: string;
  status: string;
  paymentId: string;
  payerName: string;
  payerEmail: string;
  payerLastName: string;
}

@Component({
  selector: 'app-payment-transactions-list',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatButtonToggleModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSortModule,
    RouterLink,
    CurrencyPipe,
    DatePipe,
    StatusPipe
  ],
  templateUrl: './payment-transactions-list.html',
  styleUrl: './payment-transactions-list.scss'
})
export class PaymentTransactionsList {
  readonly viewModelInputSignal = input.required<CampaignPaymentsViewModel>({alias: 'viewModel'});

  readonly processMembershipOutput = output<UUID>({alias: 'processMembership'});

  readonly viewModeSignal = signal<'MEMBERSHIPS' | 'TRANSACTIONS'>('MEMBERSHIPS');
  readonly statusFilterSignal = signal<string>('ALL');

  // Custom sorting signals matching MatSort state
  readonly membershipSortSignal = signal<Sort>({active: 'lastName', direction: 'asc'});
  readonly transactionSortSignal = signal<Sort>({active: 'checkoutDate', direction: 'desc'});

  protected readonly columnsToDisplay = ['payerName', 'checkoutDate', 'amount', 'status', 'actions'];
  protected readonly membershipColumnsToDisplay = ['lastName', 'firstName', 'payer', 'category', 'status', 'actions'];
  protected expandedElement: PaymentDetailsViewModel | null = null;

  readonly allMembershipsSignal = computed<MembershipRowViewModel[]>(() => {
    const payments = this.viewModelInputSignal().payments ?? [];
    const list: MembershipRowViewModel[] = [];
    for (const payment of payments) {
      for (const membership of payment.memberships ?? []) {
        list.push({
          id: membership.id,
          firstName: membership.firstName,
          lastName: membership.lastName,
          categoryName: membership.categoryName,
          status: membership.status,
          paymentId: payment.id,
          payerName: payment.payerName,
          payerEmail: payment.payerEmail,
          payerLastName: payment.payerLastName
        });
      }
    }
    return list;
  });

  readonly displayedMembershipsSignal = computed<MembershipRowViewModel[]>(() => {
    let list = this.allMembershipsSignal();

    const statusFilter = this.statusFilterSignal();
    if (statusFilter !== 'ALL') {
      list = list.filter(m => m.status.toLowerCase() === statusFilter.toLowerCase());
    }

    const sort = this.membershipSortSignal();
    if (sort.active && sort.direction) {
      list = [...list].sort((a, b) => {
        let compare = 0;
        if (sort.active === 'lastName') {
          compare = a.lastName.localeCompare(b.lastName, 'fr', {sensitivity: 'base'});
        } else if (sort.active === 'firstName') {
          compare = a.firstName.localeCompare(b.firstName, 'fr', {sensitivity: 'base'});
        } else if (sort.active === 'payer') {
          compare = a.payerName.localeCompare(b.payerName, 'fr', {sensitivity: 'base'});
        } else if (sort.active === 'category') {
          compare = a.categoryName.localeCompare(b.categoryName, 'fr', {sensitivity: 'base'});
        } else if (sort.active === 'status') {
          compare = a.status.localeCompare(b.status, 'fr', {sensitivity: 'base'});
        }
        return sort.direction === 'asc' ? compare : -compare;
      });
    }

    return list;
  });

  readonly displayedTransactionsSignal = computed<PaymentDetailsViewModel[]>(() => {
    let list = this.viewModelInputSignal().payments ?? [];

    const statusFilter = this.statusFilterSignal();
    if (statusFilter !== 'ALL') {
      list = list.filter(p => p.status.toLowerCase() === statusFilter.toLowerCase());
    }

    const sort = this.transactionSortSignal();
    if (sort.active && sort.direction) {
      list = [...list].sort((a, b) => {
        let compare = 0;
        if (sort.active === 'payerName') {
          compare = a.payerLastName.localeCompare(b.payerLastName, 'fr', {sensitivity: 'base'});
        } else if (sort.active === 'checkoutDate') {
          const dateA = a.checkoutDate ? new Date(a.checkoutDate).getTime() : 0;
          const dateB = b.checkoutDate ? new Date(b.checkoutDate).getTime() : 0;
          compare = dateA - dateB;
        } else if (sort.active === 'amount') {
          compare = a.amount - b.amount;
        } else if (sort.active === 'status') {
          compare = a.status.localeCompare(b.status, 'fr', {sensitivity: 'base'});
        }
        return sort.direction === 'asc' ? compare : -compare;
      });
    }

    return list;
  });

  readonly availableStatusesSignal = computed<string[]>(() => {
    const viewMode = this.viewModeSignal();
    if (viewMode === 'MEMBERSHIPS') {
      const statuses = this.allMembershipsSignal().map(m => m.status);
      return Array.from(new Set(statuses));
    } else {
      const statuses = this.viewModelInputSignal().payments?.map(p => p.status) ?? [];
      return Array.from(new Set(statuses));
    }
  });

  onViewModeChange(mode: 'MEMBERSHIPS' | 'TRANSACTIONS'): void {
    this.viewModeSignal.set(mode);
    this.statusFilterSignal.set('ALL');
    this.membershipSortSignal.set({active: 'lastName', direction: 'asc'});
    this.transactionSortSignal.set({active: 'checkoutDate', direction: 'desc'});
  }

  onStatusFilterChange(status: string): void {
    this.statusFilterSignal.set(status);
  }

  onSortMemberships(sort: Sort): void {
    this.membershipSortSignal.set(sort);
  }

  onSortTransactions(sort: Sort): void {
    this.transactionSortSignal.set(sort);
  }

  protected toggleRow(element: PaymentDetailsViewModel): void {
    this.expandedElement = this.expandedElement === element ? null : element;
  }

  protected onProcess(membershipId: string, event: Event): void {
    event.stopPropagation();
    this.processMembershipOutput.emit(membershipId);
  }
}
