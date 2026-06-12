import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {TestBed} from '@angular/core/testing';
import {signal} from '@angular/core';
import {provideHttpClient, withXhr} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {
  APP_CONFIG,
  MembershipGateway,
  MembershipPaymentOrder,
  PaymentResponse,
  PaymentStatusResponse
} from '@shared-api';
import {firstValueFrom} from 'rxjs';

describe('MembershipGateway', () => {
  let gateway: MembershipGateway;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        MembershipGateway,
        {
          provide: APP_CONFIG,
          useValue: {apiUrl: 'http://test.api'}
        }
      ]
    });

    gateway = TestBed.inject(MembershipGateway);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should initiate membership payment and return checkout URL string', async () => {
    const order: MembershipPaymentOrder = {
      campaignId: 'campaign-123',
      paymentPayerInfoCreateRequest: {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com'
      },
      membershipCreateRequests: [
        {
          firstName: 'Alice',
          lastName: 'Doe',
          email: 'alice.doe@example.com',
          licenseNumber: 'LIC-999',
          category: {
            name: 'U11',
            amount: 100.00
          }
        }
      ],
      hasDiscount: false
    };

    const checkoutUrl = 'https://checkout.sumup.com/pay/sumup-chk-789';

    const promise = firstValueFrom(gateway.initiateMembershipPayment(order));

    const req = httpTestingController.expectOne('http://test.api/api/v1/memberships/orders');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(order);
    req.flush(checkoutUrl);

    const result = await promise;
    expect(result).toEqual(checkoutUrl);
  });

  it('should fetch single payment transaction', async () => {
    const mockPayment: PaymentResponse = {
      id: 'tx-456',
      campaignId: 'campaign-123',
      amount: 100.00,
      payerInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com'
      },
      status: 'PENDING',
      isDiscounted: false,
      memberships: []
    };

    const promise = firstValueFrom(gateway.getPaymentTransaction('tx-456'));

    const req = httpTestingController.expectOne('http://test.api/api/v1/memberships/payments/tx-456');
    expect(req.request.method).toBe('GET');
    req.flush(mockPayment);

    const result = await promise;
    expect(result).toEqual(mockPayment);
  });

  it('should fetch payment transaction status publicly', async () => {
    const mockStatusResponse: PaymentStatusResponse = {
      status: 'PENDING'
    };

    const promise = firstValueFrom(gateway.getPaymentTransactionStatus('tx-456'));

    const req = httpTestingController.expectOne('http://test.api/api/public/memberships/payments/tx-456/status');
    expect(req.request.method).toBe('GET');
    req.flush(mockStatusResponse);

    const result = await promise;
    expect(result).toEqual(mockStatusResponse);
  });

  it('should fetch payment transactions by campaign using httpResource', async () => {
    const campaignIdSignal = signal<any>('campaign-123');
    const mockPayments: PaymentResponse[] = [
      {
        id: 'tx-456',
        campaignId: 'campaign-123',
        amount: 100.00,
        payerInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com'
        },
        status: 'PENDING',
        isDiscounted: false,
        memberships: []
      }
    ];

    const resource = TestBed.runInInjectionContext(() => gateway.getPaymentTransactionsByCampaign(campaignIdSignal));
    TestBed.flushEffects();

    const req = httpTestingController.expectOne('http://test.api/api/v1/campaigns/campaign-123/payments');
    expect(req.request.method).toBe('GET');
    req.flush(mockPayments);

    await new Promise(resolve => setTimeout(resolve, 0));
    expect(resource.value()).toEqual(mockPayments);
  });

  it('should process a membership', async () => {
    const promise = firstValueFrom(gateway.processMembership('membership-123'));

    const req = httpTestingController.expectOne('http://test.api/api/v1/memberships/membership-123/process');
    expect(req.request.method).toBe('POST');
    req.flush(null);

    await promise;
  });

  it('should fetch a single membership', async () => {
    const mockMembership = {
      id: 'membership-123',
      campaignId: 'campaign-123',
      firstName: 'Alice',
      lastName: 'Doe',
      email: 'alice@doe.com',
      licenseNumber: 'LIC-1',
      categoryName: 'U11',
      amount: 100.00,
      status: 'PENDING'
    };

    const promise = firstValueFrom(gateway.getMembership('membership-123'));

    const req = httpTestingController.expectOne('http://test.api/api/v1/memberships/membership-123');
    expect(req.request.method).toBe('GET');
    req.flush(mockMembership);

    const result = await promise;
    expect(result).toEqual(mockMembership);
  });
});
