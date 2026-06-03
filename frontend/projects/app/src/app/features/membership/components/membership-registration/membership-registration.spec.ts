import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MembershipRegistrationComponent} from './membership-registration';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {CampaignStore, MembershipGateway} from '@shared-api';
import {CampaignStatus} from '@shared-domain';
import {signal} from '@angular/core';
import {of} from 'rxjs';
import {NotificationService} from '@shared-ui';
import {registerLocaleData} from '@angular/common';
import localeFr from '@angular/common/locales/fr';

registerLocaleData(localeFr);

describe('MembershipRegistrationComponent', () => {
  let component: MembershipRegistrationComponent;
  let fixture: ComponentFixture<MembershipRegistrationComponent>;
  let mockCampaignStore: any;
  let mockMembershipGateway: any;
  let mockNotificationService: any;

  const mockCampaign = {
    id: 'campaign-123',
    seasonId: 'season-456',
    status: CampaignStatus.LAUNCHED,
    categories: [{name: 'U11', amount: 100}]
  };

  beforeEach(async () => {
    mockCampaignStore = {
      activeCampaignSignal: signal(mockCampaign),
      isActiveCampaignLoadingSignal: signal(false),
      activeCampaignErrorSignal: signal(null)
    };

    mockMembershipGateway = {
      initiateMembershipPayment: vi.fn().mockReturnValue(of('https://checkout.sumup.com/pay/123'))
    };

    mockNotificationService = {
      show: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        MembershipRegistrationComponent,
        NoopAnimationsModule
      ],
      providers: [
        {provide: CampaignStore, useValue: mockCampaignStore},
        {provide: MembershipGateway, useValue: mockMembershipGateway},
        {provide: NotificationService, useValue: mockNotificationService}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MembershipRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load active campaign', () => {
    expect(component).toBeTruthy();
    expect(component.activeCampaignSignal()).toEqual(mockCampaign);
    expect(component.viewModelSignal()?.campaign).toEqual(mockCampaign);
  });

  it('should submit registration and call initiatePayment', () => {
    const order: any = {campaignId: 'campaign-123', membershipCreateRequests: []};

    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    component.onSubmit(order);

    expect(mockMembershipGateway.initiateMembershipPayment).toHaveBeenCalledWith(order);
    expect(mockNotificationService.show).toHaveBeenCalledWith('Inscription enregistrée. Redirection vers le paiement SumUp...', 'success');
    expect(openSpy).toHaveBeenCalledWith('https://checkout.sumup.com/pay/123', '_self');

    openSpy.mockRestore();
  });
});
