import {afterAll, afterEach, beforeAll, beforeEach, describe, expect, it} from 'vitest';
import {setupServer} from 'msw/node';
import {http, HttpResponse} from 'msw';
import {TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {APP_CONFIG, MembershipStore, PaymentResponse} from '@shared-api';
import {firstValueFrom} from 'rxjs';

const checkoutUrl = 'https://checkout.sumup.com/pay/sumup-chk-789';

const mockPayments: PaymentResponse[] = [
  {
    id: 'tx-123',
    campaignId: 'campaign-123',
    amount: 100.00,
    payerInfo: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com'
    },
    status: 'PENDING',
    isDiscounted: false,
    memberships: [
      {
        id: 'membership-001',
        campaignId: 'campaign-123',
        firstName: 'Alice',
        lastName: 'Doe',
        email: 'alice@doe.com',
        licenseNumber: 'LIC-1',
        categoryName: 'U11',
        amount: 100.00,
        status: 'PENDING'
      }
    ]
  }
];

const server = setupServer(
  http.get('*/api/v1/campaigns/:id/payments', async () => {
    return HttpResponse.json(mockPayments);
  }),
  http.post('*/api/v1/memberships/:id/process', async () => {
    return new HttpResponse(null, {status: 204});
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
    expect(store.errorSignal()).toBeUndefined();
    expect(store.paymentsListSignal()).toEqual([]);
    expect(store.allMembershipsSignal()).toEqual([]);
  });

  it('should load all payments and compute all memberships', async () => {
    store.loadAllPayments('campaign-123');

    await new Promise(resolve => setTimeout(resolve, 50));

    expect(store.paymentsListSignal()).toEqual(mockPayments);
    expect(store.allMembershipsSignal()).toEqual(mockPayments[0].memberships);
  });

  it('should process a membership and update status in cache', async () => {
    store.loadAllPayments('campaign-123');
    await new Promise(resolve => setTimeout(resolve, 50));

    const promise = firstValueFrom(store.processMembership('membership-001'));
    await promise;

    const updatedMember = store.allMembershipsSignal().find(membership => membership.id === 'membership-001');
    expect(updatedMember?.status).toBe('PROCESSED');
  });

  it('should compute campaignPaymentsViewModelSignal correctly', async () => {
    store.loadAllPayments('campaign-123');
    await new Promise(resolve => setTimeout(resolve, 50));

    const viewModel = store.campaignPaymentsViewModelSignal();
    expect(viewModel.isLoading).toBe(false);
    expect(viewModel.error).toBeUndefined();
    expect(viewModel.payments).toHaveLength(1);
    expect(viewModel.payments[0].payerName).toBe('John Doe');
    expect(viewModel.payments[0].memberships).toHaveLength(1);
    expect(viewModel.payments[0].memberships[0].firstName).toBe('Alice');
  });
});
