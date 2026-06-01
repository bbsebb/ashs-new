import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {APP_CONFIG, MembershipGateway, MembershipPaymentOrder, MembershipPaymentResponse} from '@shared-api';
import {firstValueFrom} from 'rxjs';

describe('MembershipGateway', () => {
  let gateway: MembershipGateway;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
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

  it('should initiate membership payment and return payment response', async () => {
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
      ]
    };

    const mockResponse: MembershipPaymentResponse = {
      paymentTransactionId: 'tx-456',
      sumupCheckout: {
        id: 'sumup-chk-789',
        description: 'Licence',
        returnUrl: 'http://return-url',
        date: '2026-05-31T19:30:24',
        checkoutUrl: 'https://checkout.sumup.com/pay/sumup-chk-789'
      },
      memberships: [
        {
          id: 'membership-001',
          campaignId: 'campaign-123',
          firstName: 'Alice',
          lastName: 'Doe',
          email: 'alice.doe@example.com',
          licenseNumber: 'LIC-999',
          categoryName: 'U11',
          amount: 100.00,
          status: 'PENDING'
        }
      ]
    };

    const promise = firstValueFrom(gateway.initiateMembershipPayment(order));

    const req = httpTestingController.expectOne('http://test.api/api/v1/memberships/orders');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(order);
    req.flush(mockResponse);

    const result = await promise;
    expect(result).toEqual(mockResponse);
  });
});
