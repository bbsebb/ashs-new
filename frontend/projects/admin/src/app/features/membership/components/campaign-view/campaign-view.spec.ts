import {render, screen} from '@testing-library/angular';
import {describe, expect, it, vi} from 'vitest';
import {CampaignView} from './campaign-view';
import {CampaignStore, SeasonsStore} from '@shared-api';
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
        {provide: NotificationService, useValue: mocks.notificationService},
        {provide: DialogService, useValue: mocks.dialogService},
        provideRouter([]),
        provideAnimationsAsync('noop')
      ]
    });

    expect(screen.getByText(/Campagne 2024-2025/i)).toBeDefined();
    expect(screen.getByText('Brouillon')).toBeDefined();
    expect(screen.getByText('Senior')).toBeDefined();
    expect(screen.getByText('Aperçu Financier (Fictif)')).toBeDefined();
  });

  it('should show launch button only for DRAFT status', async () => {
    const campaign = {id: 'c1', seasonId: 's1', status: CampaignStatus.DRAFT, categories: []};
    const mocks = setupMocks(campaign);

    await render(CampaignView, {
      componentInputs: {id: 'c1'},
      providers: [
        {provide: CampaignStore, useValue: mocks.campaignStore},
        {provide: SeasonsStore, useValue: mocks.seasonsStore},
        {provide: NotificationService, useValue: mocks.notificationService},
        {provide: DialogService, useValue: mocks.dialogService},
        provideRouter([]),
        provideAnimationsAsync('noop')
      ]
    });

    expect(screen.getByText(/Lancer la campagne/i)).toBeDefined();
  });
});
