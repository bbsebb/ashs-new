import {ChangeDetectionStrategy, Component, computed, inject, OnInit} from '@angular/core';
import {CampaignStore, MembershipPaymentOrder, MembershipStore} from '@shared-api';
import {ErrorData, LoadingData, NotificationService} from '@shared-ui';
import {MembershipFormComponent, MembershipFormViewModel} from '../membership-form/membership-form';
import {CommonModule} from '@angular/common';

/**
 * Smart Component for Membership registration.
 * Coordinates loading the active campaign and triggering payment initiation.
 */
@Component({
  selector: 'app-membership-registration',
  imports: [
    CommonModule,
    LoadingData,
    ErrorData,
    MembershipFormComponent
  ],
  templateUrl: './membership-registration.html',
  styleUrl: './membership-registration.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MembershipRegistrationComponent implements OnInit {
  private readonly _campaignStore = inject(CampaignStore);
  private readonly _membershipStore = inject(MembershipStore);
  private readonly _notificationService = inject(NotificationService);

  /** Loading state of the campaigns */
  readonly isCampaignsLoadingSignal = this._campaignStore.isActiveCampaignLoadingSignal;

  /** Error state of the campaigns loading */
  readonly campaignsErrorSignal = this._campaignStore.activeCampaignErrorSignal;

  /** Resolves the single active campaign at status LAUNCHED. */
  readonly activeCampaignSignal = this._campaignStore.activeCampaignSignal;

  /** Aggregated ViewModel for the presentational form. */
  readonly viewModelSignal = computed<MembershipFormViewModel | null>(() => {
    const campaign = this.activeCampaignSignal();
    const isSubmitting = this._membershipStore.isLoadingSignal();
    if (!campaign) {
      return null;
    }
    return {
      campaign,
      isSubmitting
    };
  });

  ngOnInit(): void {
    // Reset membership store state to avoid keeping previous transaction responses
    this._membershipStore.resetState();
  }

  /**
   * Triggers the payment order initiation and redirects user to SumUp checkout page on success.
   * @param order The payment order details.
   */
  onSubmit(order: MembershipPaymentOrder): void {
    this._membershipStore.initiatePayment(order).subscribe({
      next: (response) => {
        this._notificationService.show('Inscription enregistrée. Redirection vers le paiement SumUp...', 'success');
        // Redirect the window to SumUp hosted payment page
        window.location.href = response.sumupCheckout.checkoutUrl;
      },
      error: () => {
        this._notificationService.show("Une erreur est survenue lors de l'initialisation du paiement.", 'error');
      }
    });
  }
}
