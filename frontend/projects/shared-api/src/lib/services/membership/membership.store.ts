import {computed, inject, Injectable, signal} from '@angular/core';
import {Observable, tap} from 'rxjs';
import {MembershipGateway} from './membership.gateway';
import {MembershipResponse} from './membership.dtos';
import {UUID} from '@shared-domain';

import {CampaignPaymentsViewModel} from './membership.view-models';

/**
 * Store for managing membership status, payment initialization, and caching.
 */
@Injectable({
  providedIn: 'root',
})
export class MembershipStore {
  private readonly _membershipGateway = inject(MembershipGateway);

  readonly campaignIdSignal = signal<UUID | undefined>(undefined);

  private readonly _paymentsResource = this._membershipGateway.getPaymentTransactionsByCampaign(
    this.campaignIdSignal
  );

  /** Internal signals for managing state */
  readonly paymentsListSignal = computed(() =>
    this._paymentsResource.hasValue() ? this._paymentsResource.value() : []
  );
  readonly isLoadingSignal = this._paymentsResource.isLoading;
  readonly errorSignal = this._paymentsResource.error;

  /** Computed signal extracting all memberships from loaded transactions */
  readonly allMembershipsSignal = computed<MembershipResponse[]>(() => {
    return this.paymentsListSignal().flatMap(payment => payment.memberships);
  });

  /** Computed ViewModel for displaying the campaign payments list */
  readonly campaignPaymentsViewModelSignal = computed<CampaignPaymentsViewModel>(() => {
    const payments = this.paymentsListSignal().map(payment => ({
      id: payment.id,
      campaignId: payment.campaignId,
      amount: payment.amount,
      payerName: payment.payerInfo ? `${payment.payerInfo.firstName} ${payment.payerInfo.lastName}` : 'Inconnu',
      payerEmail: payment.payerInfo?.email ?? '',
      payerFirstName: payment.payerInfo?.firstName ?? 'Inconnu',
      payerLastName: payment.payerInfo?.lastName ?? '',
      status: payment.status,
      checkoutDate: payment.checkoutDate,
      isDiscounted: payment.isDiscounted,
      memberships: payment.memberships.map(membership => ({
        id: membership.id,
        firstName: membership.firstName,
        lastName: membership.lastName,
        categoryName: membership.categoryName,
        status: membership.status,
        amount: membership.amount
      }))
    }));
    return {
      payments,
      isLoading: this.isLoadingSignal(),
      error: this.errorSignal()
    };
  });

  /**
   * Loads all payment transactions for a campaign and stores them in the cache.
   */
  loadAllPayments(campaignId: UUID): void {
    this.campaignIdSignal.set(campaignId);
  }

  /**
   * Processes a membership (marks it as PROCESSED) and updates the local cache.
   * @param id The membership ID to process.
   */
  processMembership(id: UUID): Observable<void> {
    return this._membershipGateway.processMembership(id).pipe(
      tap(() => {
        this._paymentsResource.update(payments =>
          payments ? payments.map(payment => ({
            ...payment,
            memberships: payment.memberships.map(membership =>
              membership.id === id ? {...membership, status: 'PROCESSED'} : membership
            )
          })) : []
        );
      })
    );
  }
}
