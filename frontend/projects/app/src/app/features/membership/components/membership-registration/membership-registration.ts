import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {CampaignStore, MembershipGateway, MembershipPaymentOrder} from '@shared-api';
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
export class MembershipRegistrationComponent {
  private readonly _campaignStore = inject(CampaignStore);
  private readonly _membershipGateway = inject(MembershipGateway);
  private readonly _notificationService = inject(NotificationService);

  /** Loading state of the campaigns */
  readonly isCampaignsLoadingSignal = this._campaignStore.isActiveCampaignLoadingSignal;

  /** Error state of the campaigns loading */
  readonly campaignsErrorSignal = this._campaignStore.activeCampaignErrorSignal;

  /** Resolves the single active campaign at status LAUNCHED. */
  readonly activeCampaignSignal = this._campaignStore.activeCampaignSignal;

  /** Local submission loading state */
  readonly isSubmittingSignal = signal<boolean>(false);

  /** Aggregated ViewModel for the presentational form. */
  readonly viewModelSignal = computed<MembershipFormViewModel | null>(() => {
    const campaign = this.activeCampaignSignal();
    const isSubmitting = this.isSubmittingSignal();
    if (!campaign) {
      return null;
    }
    return {
      campaign,
      isSubmitting
    };
  });

  /**
   * Triggers the payment order initiation and redirects user to SumUp checkout page on success.
   * @param order The payment order details.
   */
  onSubmit(order: MembershipPaymentOrder): void {
    this.isSubmittingSignal.set(true);
    this._membershipGateway.initiateMembershipPayment(order).subscribe({
      next: (checkoutUrl) => {
        this.isSubmittingSignal.set(false);
        this._notificationService.show('Inscription enregistrée. Redirection vers le paiement SumUp...', 'success');
        // Redirect the window to SumUp hosted payment page
        window.open(checkoutUrl, '_self');
      },
      error: () => {
        this.isSubmittingSignal.set(false);
        this._notificationService.show("Une erreur est survenue lors de l'initialisation du paiement.", 'error');
      }
    });
  }
}
