import {render, screen} from '@testing-library/angular';
import {describe, expect, it, vi} from 'vitest';
import {CampaignForm} from './campaign-form';
import {APP_CONFIG, CampaignStore, SeasonsStore} from '@shared-api';
import {signal} from '@angular/core';
import {Router} from '@angular/router';
import {NotificationService} from '@shared-ui';
import {of} from 'rxjs';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {MatDialogRef} from '@angular/material/dialog';

/**
 * Unit tests for CampaignForm component.
 */
describe('CampaignForm Component (Admin)', () => {
  const setupMocks = (existingCampaign?: any) => {
    return {
      campaignStore: {
        campaignById: vi.fn().mockReturnValue(signal(existingCampaign)),
        createCampaign: vi.fn().mockReturnValue(of({id: 'new-campaign'})),
        updateCampaign: vi.fn().mockReturnValue(of({id: 'existing-campaign'})),
        isLoadingSignal: signal(false),
        campaignsSignal: signal([])
      },
      seasonsStore: {
        seasonsSignal: signal([]),
        isLoadingSignal: signal(false)
      },
      notificationService: {show: vi.fn()},
      router: {navigateByUrl: vi.fn().mockReturnValue(Promise.resolve(true))}
    };
  };

  it('should render the creation form by default', async () => {
    const mocks = setupMocks();
    await render(CampaignForm, {
      providers: [
        {provide: CampaignStore, useValue: mocks.campaignStore},
        {provide: SeasonsStore, useValue: mocks.seasonsStore},
        {provide: NotificationService, useValue: mocks.notificationService},
        {provide: Router, useValue: mocks.router},
        {provide: APP_CONFIG, useValue: {apiUrl: 'http://test.api'}},
        {provide: MatDialogRef, useValue: {}},
        provideAnimationsAsync('noop')
      ]
    });

    const title = screen.getByText(/Nouvelle campagne/i);
    expect(title).toBeDefined();

    const submitButton = screen.getByRole('button', {name: /enregistrer/i});
    expect(submitButton).toBeDefined();
  });

  it('should render the edit form when an id is provided', async () => {
    const mocks = setupMocks({id: 'existing-id', seasonId: 'season-1', categories: []});
    await render(CampaignForm, {
      componentInputs: {id: 'existing-id'},
      providers: [
        {provide: CampaignStore, useValue: mocks.campaignStore},
        {provide: SeasonsStore, useValue: mocks.seasonsStore},
        {provide: NotificationService, useValue: mocks.notificationService},
        {provide: Router, useValue: mocks.router},
        {provide: APP_CONFIG, useValue: {apiUrl: 'http://test.api'}},
        {provide: MatDialogRef, useValue: {}},
        provideAnimationsAsync('noop')
      ]
    });

    const title = screen.getByText(/Modifier la campagne/i);
    expect(title).toBeDefined();

    const submitButton = screen.getByRole('button', {name: /modifier/i});
    expect(submitButton).toBeDefined();
  });
});
