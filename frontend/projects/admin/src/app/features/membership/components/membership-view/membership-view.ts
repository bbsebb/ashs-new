import {Component, computed, inject, input, ChangeDetectionStrategy} from '@angular/core';
import {APP_CONFIG, MembershipDetailsViewModel} from '@shared-api';
import {AdminPageContainer, ErrorData, LoadingData, MembershipDetails} from '@shared-ui';
import {httpResource} from '@angular/common/http';

@Component({
  selector: 'app-membership-view',
  imports: [
    LoadingData,
    ErrorData,
    AdminPageContainer,
    MembershipDetails
  ],
  templateUrl: './membership-view.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './membership-view.scss'
})
export class MembershipView {
  private readonly _appConfig = inject(APP_CONFIG);

  readonly idInputSignal = input.required<string>({alias: 'id'});

  private readonly _membershipResource = httpResource<MembershipDetailsViewModel>(() => {
    const id = this.idInputSignal();
    return id ? `${this._appConfig.apiUrl}/api/v1/memberships/${id}` : undefined;
  }, {
    parse: (membership: any): MembershipDetailsViewModel => ({
      id: membership.id,
      campaignId: membership.campaignId,
      firstName: membership.firstName,
      lastName: membership.lastName,
      email: membership.email,
      licenseNumber: membership.licenseNumber,
      categoryName: membership.categoryName,
      amount: membership.amount,
      status: membership.status
    })
  });

  readonly viewModelSignal = computed(() => this._membershipResource.value());
  readonly isLoadingSignal = this._membershipResource.isLoading;
  readonly errorSignal = this._membershipResource.error;
}
