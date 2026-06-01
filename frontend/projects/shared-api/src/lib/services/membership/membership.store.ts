import {computed, inject, Injectable, signal} from '@angular/core';
import {catchError, Observable, tap, throwError} from 'rxjs';
import {MembershipGateway} from './membership.gateway';
import {MembershipPaymentOrder, MembershipPaymentResponse} from './membership.dtos';

/**
 * Interface representing the ViewModel for membership operations.
 */
export interface MembershipViewModel {
  isLoading: boolean;
  error: any;
  paymentResponse: MembershipPaymentResponse | null;
}

/**
 * Store for managing membership status, payment initialization, and caching.
 */
@Injectable({
  providedIn: 'root',
})
export class MembershipStore {
  private readonly _membershipGateway = inject(MembershipGateway);

  /** Internal signals for managing state */
  readonly isLoadingSignal = signal<boolean>(false);
  readonly errorSignal = signal<any>(null);
  readonly paymentResponseSignal = signal<MembershipPaymentResponse | null>(null);

  /** Computed ViewModel for reactive binding in views */
  readonly membershipViewModelSignal = computed<MembershipViewModel>(() => ({
    isLoading: this.isLoadingSignal(),
    error: this.errorSignal(),
    paymentResponse: this.paymentResponseSignal(),
  }));

  /**
   * Initiates a new membership payment transaction.
   * Updates state signals accordingly.
   *
   * @param order The details of the membership order.
   * @returns An Observable of the payment response.
   */
  initiatePayment(order: MembershipPaymentOrder): Observable<MembershipPaymentResponse> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return this._membershipGateway.initiateMembershipPayment(order).pipe(
      tap((response) => {
        this.paymentResponseSignal.set(response);
        this.isLoadingSignal.set(false);
      }),
      catchError((error) => {
        this.errorSignal.set(error);
        this.isLoadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Resets the store's state.
   */
  resetState(): void {
    this.isLoadingSignal.set(false);
    this.errorSignal.set(null);
    this.paymentResponseSignal.set(null);
  }
}
