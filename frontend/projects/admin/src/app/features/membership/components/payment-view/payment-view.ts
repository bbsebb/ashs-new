import {Component, computed, inject, input} from '@angular/core';
import {APP_CONFIG, PaymentDetailsViewModel} from '@shared-api';
import {AdminPageContainer, ErrorData, LoadingData, PaymentDetails} from '@shared-ui';
import {httpResource} from '@angular/common/http';

@Component({
  selector: 'app-payment-view',
  imports: [
    LoadingData,
    ErrorData,
    AdminPageContainer,
    PaymentDetails
  ],
  templateUrl: './payment-view.html',
  styleUrl: './payment-view.scss'
})
export class PaymentView {
  private readonly _appConfig = inject(APP_CONFIG);

  readonly idInputSignal = input.required<string>({alias: 'id'});

  private readonly _paymentResource = httpResource<PaymentDetailsViewModel>(() => {
    const id = this.idInputSignal();
    return id ? `${this._appConfig.apiUrl}/api/v1/memberships/payments/${id}` : undefined;
  }, {
    parse: (payment: any): PaymentDetailsViewModel => ({
      id: payment.id,
      campaignId: payment.campaignId,
      amount: payment.amount,
      payerName: payment.payerInfo ? `${payment.payerInfo.firstName} ${payment.payerInfo.lastName}` : 'Inconnu',
      payerEmail: payment.payerInfo?.email ?? '',
      status: payment.status,
      checkoutDate: payment.checkoutDate,
      isDiscounted: payment.isDiscounted,
      memberships: (payment.memberships ?? []).map((membership: any) => ({
        id: membership.id,
        firstName: membership.firstName,
        lastName: membership.lastName,
        categoryName: membership.categoryName,
        status: membership.status
      }))
    })
  });

  readonly viewModelSignal = computed(() => this._paymentResource.value());
  readonly isLoadingSignal = this._paymentResource.isLoading;
  readonly errorSignal = this._paymentResource.error;
}
