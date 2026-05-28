import {render, screen} from '@testing-library/angular';
import {describe, expect, it, vi} from 'vitest';
import {CampaignsList} from './campaigns-list';
import {CampaignStore, SeasonsStore} from '@shared-api';
import {signal} from '@angular/core';
import {provideRouter} from '@angular/router';
import {DialogService, NotificationService} from '@shared-ui';
import {of} from 'rxjs';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {CampaignStatus} from '@shared-domain';

describe('CampaignsList Component (Admin)', () => {
  const setupMocks = (campaigns: any[] = [], seasons: any[] = []) => {
    return {
      campaignStore: {
        campaignsSignal: signal(campaigns),
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
      dialogService: {showConfirmation: vi.fn().mockReturnValue(of(true))},
      router: {navigateByUrl: vi.fn().mockReturnValue(Promise.resolve(true))}
    };
  };

  it('should render the list with campaigns', async () => {
    const mocks = setupMocks(
      [{id: 'c1', seasonId: 's1', status: CampaignStatus.DRAFT}],
      [{id: 's1', name: '2024-2025'}]
    );

    await render(CampaignsList, {
      providers: [
        {provide: CampaignStore, useValue: mocks.campaignStore},
        {provide: SeasonsStore, useValue: mocks.seasonsStore},
        {provide: NotificationService, useValue: mocks.notificationService},
        {provide: DialogService, useValue: mocks.dialogService},
        provideRouter([]),
        provideAnimationsAsync('noop')
      ]
    });

    expect(screen.getByText('2024-2025')).toBeDefined();
    expect(screen.getByText('Brouillon')).toBeDefined();
  });

  it('should show launch button for DRAFT campaign', async () => {
    const mocks = setupMocks([{id: 'c1', seasonId: 's1', status: CampaignStatus.DRAFT}]);

    await render(CampaignsList, {
      providers: [
        {provide: CampaignStore, useValue: mocks.campaignStore},
        {provide: SeasonsStore, useValue: mocks.seasonsStore},
        {provide: NotificationService, useValue: mocks.notificationService},
        {provide: DialogService, useValue: mocks.dialogService},
        provideRouter([]),
        provideAnimationsAsync('noop')
      ]
    });

    expect(screen.getByLabelText('Lancer')).toBeDefined();
  });

  it('should show close button for LAUNCHED campaign', async () => {
    const mocks = setupMocks([{id: 'c1', seasonId: 's1', status: CampaignStatus.LAUNCHED}]);

    await render(CampaignsList, {
      providers: [
        {provide: CampaignStore, useValue: mocks.campaignStore},
        {provide: SeasonsStore, useValue: mocks.seasonsStore},
        {provide: NotificationService, useValue: mocks.notificationService},
        {provide: DialogService, useValue: mocks.dialogService},
        provideRouter([]),
        provideAnimationsAsync('noop')
      ]
    });

    expect(screen.getByLabelText('Fermer')).toBeDefined();
  });
});
