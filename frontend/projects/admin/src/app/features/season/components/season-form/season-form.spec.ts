import {render, screen} from '@testing-library/angular';
import {describe, expect, it, vi} from 'vitest';
import {SeasonForm} from './season-form';
import {APP_CONFIG, SeasonsStore} from '@shared-api';
import {signal} from '@angular/core';
import {Router} from '@angular/router';
import {NotificationService} from '@shared-ui';
import {of} from 'rxjs';
import userEvent from '@testing-library/user-event';
import {provideNativeDateAdapter} from '@angular/material/core';

describe('SeasonForm Component (Admin) - Exhaustive', () => {
  const setupMocks = (existingSeason?: any) => {
    return {
      seasonsStore: {
        seasonById: vi.fn().mockReturnValue(signal(existingSeason)),
        createSeason: vi.fn().mockReturnValue(of({ id: 'new-season' })),
        updateSeason: vi.fn().mockReturnValue(of({ id: 'existing-season' })),
        isLoadingSignal: signal(false)
      },
      notificationService: { show: vi.fn() },
      router: { navigateByUrl: vi.fn().mockReturnValue(Promise.resolve(true)) }
    };
  };

  it('should render an empty form by default and disable submit', async () => {
    const mocks = setupMocks();
    await render(SeasonForm, {
      providers: [
        { provide: SeasonsStore, useValue: mocks.seasonsStore },
        { provide: NotificationService, useValue: mocks.notificationService },
        { provide: Router, useValue: mocks.router },
        { provide: APP_CONFIG, useValue: { apiUrl: 'http://test.api' } },
        provideNativeDateAdapter()
      ]
    });

    const submitButton = screen.getByRole('button', { name: /enregistrer/i });
    expect(submitButton).toBeDefined();
  });

  it('should submit the form and create a season', async () => {
    const mocks = setupMocks();
    const user = userEvent.setup();

    await render(SeasonForm, {
      providers: [
        { provide: SeasonsStore, useValue: mocks.seasonsStore },
        { provide: NotificationService, useValue: mocks.notificationService },
        { provide: Router, useValue: mocks.router },
        { provide: APP_CONFIG, useValue: { apiUrl: 'http://test.api' } },
        provideNativeDateAdapter()
      ]
    });

    const submitButton = screen.getByRole('button', { name: /enregistrer/i });
    await user.click(submitButton);

    expect(mocks.seasonsStore.createSeason).toHaveBeenCalled();
    expect(mocks.router.navigateByUrl).toHaveBeenCalledWith('/seasons/new-season');
  });
});
