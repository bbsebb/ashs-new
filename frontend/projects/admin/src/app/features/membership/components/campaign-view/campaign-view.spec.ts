import {render, screen} from '@testing-library/angular';
import {describe, expect, it, vi} from 'vitest';
import {CampaignView} from './campaign-view';
import {CampaignStore, MembershipStore, SeasonsStore} from '@shared-api';
import {signal} from '@angular/core';
import {provideRouter} from '@angular/router';
import {DialogService, NotificationService} from '@shared-ui';
import {of} from 'rxjs';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {CampaignStatus} from '@shared-domain';

describe('CampaignView Component (Admin)', () => {
  const setupMocks = (campaign: any = null, seasons: any[] = []) => {
    return {
      campaignStore: {
        campaignById: vi.fn().mockReturnValue(signal(campaign)),
        isLoadingSignal: signal(false),
        errorSignal: signal(null),
        reload: vi.fn(),
        launchCampaign: vi.fn().mockReturnValue(of(void 0)),
        closeCampaign: vi.fn().mockReturnValue(of(void 0)),
        deleteById: vi.fn().mockReturnValue(of(void 0)),
      },
      seasonsStore: {
        seasonsSignal: signal(seasons),
        isLoadingSignal: signal(false)
      },
      membershipStore: {
        campaignPaymentsViewModelSignal: signal({
          payments: [],
          isLoading: false,
          error: null
        }),
        loadAllPayments: vi.fn(),
        processMembership: vi.fn().mockReturnValue(of(void 0))
      },
      notificationService: {show: vi.fn()},
      dialogService: {showConfirmation: vi.fn().mockReturnValue(of(true))}
    };
  };

  it('should render campaign details and mock stats', async () => {
    const campaign = {
      id: 'c1',
      seasonId: 's1',
      status: CampaignStatus.DRAFT,
      categories: [{name: 'Senior', amount: 150}]
    };
    const seasons = [{id: 's1', name: '2024-2025'}];
    const mocks = setupMocks(campaign, seasons);

    await render(CampaignView, {
      componentInputs: {id: 'c1'},
      providers: [
        {provide: CampaignStore, useValue: mocks.campaignStore},
        {provide: SeasonsStore, useValue: mocks.seasonsStore},
        {provide: MembershipStore, useValue: mocks.membershipStore},
        {provide: NotificationService, useValue: mocks.notificationService},
        {provide: DialogService, useValue: mocks.dialogService},
        provideRouter([]),
        provideAnimationsAsync('noop')
      ]
    });

    expect(screen.getByText(/Campagne 2024-2025/i)).toBeDefined();
    expect(screen.getByText('Brouillon')).toBeDefined();
    expect(screen.getAllByText('Senior').length).toBeGreaterThan(0);
    expect(screen.getByText('Aperçu Financier')).toBeDefined();
  });

  it('should render campaign details and calculated stats and category breakdown', async () => {
    const campaign = {
      id: 'c1',
      seasonId: 's1',
      status: CampaignStatus.DRAFT,
      categories: [{name: 'Senior', amount: 150}]
    };
    const seasons = [{id: 's1', name: '2024-2025'}];
    const mocks = setupMocks(campaign, seasons);

    // Set custom payments data with memberships
    mocks.membershipStore.campaignPaymentsViewModelSignal.set({
      payments: [
        {
          id: 'p1',
          amount: 300,
          status: 'PAID',
          payerName: 'John',
          payerEmail: 'john@example.com',
          payerFirstName: 'John',
          payerLastName: 'Doe',
          isDiscounted: false,
          memberships: [
            {
              id: 'm1',
              firstName: 'Alice',
              lastName: 'Doe',
              categoryName: 'Senior',
              status: 'PAID',
              amount: 150
            },
            {
              id: 'm2',
              firstName: 'Bob',
              lastName: 'Doe',
              categoryName: 'Senior',
              status: 'PROCESSED',
              amount: 150
            }
          ]
        },
        {
          id: 'p2',
          amount: 150,
          status: 'FAILED',
          payerName: 'Jack',
          payerEmail: 'jack@example.com',
          payerFirstName: 'Jack',
          payerLastName: 'Black',
          isDiscounted: false,
          memberships: [
            {
              id: 'm3',
              firstName: 'Charlie',
              lastName: 'Black',
              categoryName: 'Junior',
              status: 'FAILED',
              amount: 150
            }
          ]
        }
      ],
      isLoading: false,
      error: null
    });

    await render(CampaignView, {
      componentInputs: {id: 'c1'},
      providers: [
        {provide: CampaignStore, useValue: mocks.campaignStore},
        {provide: SeasonsStore, useValue: mocks.seasonsStore},
        {provide: MembershipStore, useValue: mocks.membershipStore},
        {provide: NotificationService, useValue: mocks.notificationService},
        {provide: DialogService, useValue: mocks.dialogService},
        provideRouter([]),
        provideAnimationsAsync('noop')
      ]
    });

    expect(screen.getByText(/Campagne 2024-2025/i)).toBeDefined();
    expect(screen.getByText('Brouillon')).toBeDefined();
    expect(screen.getAllByText('Senior').length).toBeGreaterThan(0);
    expect(screen.getByText('Aperçu Financier')).toBeDefined();

    // Check categories breakdown
    expect(screen.getByText(/(1 payées, 1 traitées)/i)).toBeDefined();
  });

  it('should show launch button only for DRAFT status', async () => {
    const campaign = {id: 'c1', seasonId: 's1', status: CampaignStatus.DRAFT, categories: []};
    const mocks = setupMocks(campaign);

    await render(CampaignView, {
      componentInputs: {id: 'c1'},
      providers: [
        {provide: CampaignStore, useValue: mocks.campaignStore},
        {provide: SeasonsStore, useValue: mocks.seasonsStore},
        {provide: MembershipStore, useValue: mocks.membershipStore},
        {provide: NotificationService, useValue: mocks.notificationService},
        {provide: DialogService, useValue: mocks.dialogService},
        provideRouter([]),
        provideAnimationsAsync('noop')
      ]
    });

    expect(screen.getByText(/Lancer la campagne/i)).toBeDefined();
  });
});
