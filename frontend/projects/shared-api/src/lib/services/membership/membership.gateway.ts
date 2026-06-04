import {inject, Injectable, Signal} from '@angular/core';
import {HttpClient, httpResource, HttpResourceRef} from '@angular/common/http';
import {Observable} from 'rxjs';
import {APP_CONFIG} from '../../configs/app-config';
import {MembershipPaymentOrder, MembershipResponse, PaymentResponse, PaymentStatusResponse} from './membership.dtos';
import {UUID} from '@shared-domain';

/**
 * Gateway for Membership-related API calls.
 * Handles initiating membership payment orders and fetching transactions.
 */
@Injectable({
  providedIn: 'root',
})
export class MembershipGateway {
  private readonly http = inject(HttpClient);
  private readonly appConfig = inject(APP_CONFIG);

  /**
   * Initiates a new membership payment transaction.
   * @param order The details of the membership order containing payer and applicants list.
   * @returns An Observable emitting the response checkout URL.
   */
  initiateMembershipPayment(order: MembershipPaymentOrder): Observable<string> {
    return this.http.post(
      `${this.appConfig.apiUrl}/api/v1/memberships/orders`,
      order,
      {responseType: 'text'}
    );
  }

  /**
   * Fetches detailed information about a single payment transaction.
   * @param id The transaction ID.
   */
  getPaymentTransaction(id: UUID): Observable<PaymentResponse> {
    return this.http.get<PaymentResponse>(
      `${this.appConfig.apiUrl}/api/v1/memberships/payments/${id}`
    );
  }

  /**
   * Fetches the status of a single payment transaction publicly.
   * @param id The transaction ID.
   */
  getPaymentTransactionStatus(id: UUID): Observable<PaymentStatusResponse> {
    return this.http.get<PaymentStatusResponse>(
      `${this.appConfig.apiUrl}/api/public/memberships/payments/${id}/status`
    );
  }

  /**
   * Fetches payment transactions by campaign.
   */
  getPaymentTransactionsByCampaign(campaignIdSignal: Signal<UUID | undefined>): HttpResourceRef<PaymentResponse[]> {
    return httpResource<PaymentResponse[]>(() => {
      const campaignId = campaignIdSignal();
      return campaignId ? `${this.appConfig.apiUrl}/api/v1/campaigns/${campaignId}/payments` : undefined;
    }, {
      defaultValue: []
    });
  }

  /**
   * Processes a membership (marks it as PROCESSED).
   * @param id The membership ID.
   */
  processMembership(id: UUID): Observable<void> {
    return this.http.post<void>(
      `${this.appConfig.apiUrl}/api/v1/memberships/${id}/process`,
      null
    );
  }

  /**
   * Fetches detailed information about a single membership.
   * @param id The membership ID.
   */
  getMembership(id: UUID): Observable<MembershipResponse> {
    return this.http.get<MembershipResponse>(
      `${this.appConfig.apiUrl}/api/v1/memberships/${id}`
    );
  }
}
