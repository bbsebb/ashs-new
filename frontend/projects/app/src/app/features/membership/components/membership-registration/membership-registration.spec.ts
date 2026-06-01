import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MembershipRegistrationComponent} from './membership-registration';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {CampaignStore, MembershipStore} from '@shared-api';
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
  let mockMembershipStore: any;
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

    mockMembershipStore = {
      isLoadingSignal: signal(false),
      errorSignal: signal(null),
      initiatePayment: vi.fn().mockReturnValue(of({
        paymentTransactionId: 'tx-123',
        sumupCheckout: {checkoutUrl: 'https://checkout.sumup.com/pay/123'},
        memberships: []
      })),
      resetState: vi.fn()
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
        {provide: MembershipStore, useValue: mockMembershipStore},
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

    // Stub global location.href change to avoid actual window navigation during test
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      value: {href: ''},
      writable: true,
      configurable: true
    });

    component.onSubmit(order);

    expect(mockMembershipStore.initiatePayment).toHaveBeenCalledWith(order);
    expect(mockNotificationService.show).toHaveBeenCalledWith('Inscription enregistrée. Redirection vers le paiement SumUp...', 'success');
    expect(window.location.href).toBe('https://checkout.sumup.com/pay/123');

    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: false,
      configurable: true
    });
  });
});
