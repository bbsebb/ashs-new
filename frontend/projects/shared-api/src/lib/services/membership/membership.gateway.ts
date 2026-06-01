import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {APP_CONFIG} from '../../configs/app-config';
import {MembershipPaymentOrder, MembershipPaymentResponse} from './membership.dtos';

/**
 * Gateway for Membership-related API calls.
 * Handles initiating membership payment orders.
 */
@Injectable({
  providedIn: 'root',
})
export class MembershipGateway {
  private readonly http = inject(HttpClient);
  private readonly appConfig = inject(APP_CONFIG);

  /**
   * Initiates a new membership payment transaction.
   * @param order The details of the membership order containingpayer and applicants list.
   * @returns An Observable emitting the response with transaction ID and SumUp checkout URL.
   */
  initiateMembershipPayment(order: MembershipPaymentOrder): Observable<MembershipPaymentResponse> {
    return this.http.post<MembershipPaymentResponse>(
      `${this.appConfig.apiUrl}/api/v1/memberships/orders`,
      order
    );
  }
}
