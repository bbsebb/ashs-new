import {afterAll, afterEach, beforeAll, beforeEach, describe, expect, it} from 'vitest';
import {setupServer} from 'msw/node';
import {http, HttpResponse} from 'msw';
import {TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {APP_CONFIG, MembershipPaymentOrder, MembershipPaymentResponse, MembershipStore} from '@shared-api';
import {firstValueFrom} from 'rxjs';

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

const server = setupServer(
  http.post('*/api/v1/memberships/orders', async () => {
    return HttpResponse.json(mockResponse, {status: 201});
  })
);

describe('MembershipStore', () => {
  let store: MembershipStore;

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        MembershipStore,
        {provide: APP_CONFIG, useValue: {apiUrl: 'http://api.test'}}
      ]
    });
    store = TestBed.inject(MembershipStore);
  });

  it('should initialize with default states', () => {
    expect(store.isLoadingSignal()).toBe(false);
    expect(store.errorSignal()).toBeNull();
    expect(store.paymentResponseSignal()).toBeNull();
  });

  it('should initiate payment and update signals', async () => {
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

    const promise = firstValueFrom(store.initiatePayment(order));

    expect(store.isLoadingSignal()).toBe(true);

    const result = await promise;

    expect(store.isLoadingSignal()).toBe(false);
    expect(store.errorSignal()).toBeNull();
    expect(store.paymentResponseSignal()).toEqual(mockResponse);
    expect(result).toEqual(mockResponse);
  });
});
