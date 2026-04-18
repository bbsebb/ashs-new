import {render, screen} from '@testing-library/angular';
import {describe, expect, it, vi} from 'vitest';
import {TeamView} from './team-view';
import {APP_CONFIG, TeamsStore} from '@shared-api';
import {signal} from '@angular/core';
import {provideRouter, Router} from '@angular/router';
import {NotificationService} from '@shared-ui';
import {of} from 'rxjs';
import userEvent from '@testing-library/user-event';
import {Team} from '@shared-domain';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';

describe('TeamView Component (Admin)', () => {
  const mockTeam: Team = {
    id: 't1',
    seasonId: 's1',
    gender: 'Male',
    teamNumber: 1,
    photoFileName: null,
    ageGroup: { id: 'ag1', name: 'U18', ageLimit: 18, upperLimit: true },
    staffs: [],
    trainingSessions: []
  };

  const setupMocks = (teamData?: Team | null) => {
    return {
      teamsStore: {
        teamById: vi.fn().mockReturnValue(signal(teamData)),
        isLoadingSignal: signal(false),
        errorSignal: signal<Error | null>(null),
        deleteById: vi.fn().mockReturnValue(of(void 0)),
        reload: vi.fn()
      },
      notificationService: { show: vi.fn() },
      router: { navigateByUrl: vi.fn().mockReturnValue(Promise.resolve(true)) }
    };
  };

  it('should render loading state when data is loading', async () => {
    const mocks = setupMocks(undefined);
    mocks.teamsStore.isLoadingSignal.set(true);

    await render(TeamView, {
      inputs: { id: 't1' },
      providers: [
        { provide: TeamsStore, useValue: mocks.teamsStore },
        { provide: NotificationService, useValue: mocks.notificationService },
        { provide: APP_CONFIG, useValue: { apiUrl: 'http://test.api' } },
        provideRouter([])
      ]
    });

    expect(screen.getByText(/Chargement de l'équipe/i)).toBeDefined();
  });

  it('should render error state and allow retry', async () => {
    const mocks = setupMocks(undefined);
    mocks.teamsStore.errorSignal.set(new Error('Network error'));

    const user = userEvent.setup();
    await render(TeamView, {
      inputs: { id: 't1' },
      providers: [
        { provide: TeamsStore, useValue: mocks.teamsStore },
        { provide: NotificationService, useValue: mocks.notificationService },
        { provide: APP_CONFIG, useValue: { apiUrl: 'http://test.api' } },
        provideRouter([])
      ]
    });

    expect(screen.getByText(/Impossible de charger équipes/i)).toBeDefined();

    const retryBtn = screen.getByRole('button', { name: /réessayer/i });
    await user.click(retryBtn);

    expect(mocks.teamsStore.reload).toHaveBeenCalled();
  });

  it('should render team details when data is loaded', async () => {
    const mocks = setupMocks(mockTeam);

    await render(TeamView, {
      inputs: { id: 't1' },
      providers: [
        { provide: TeamsStore, useValue: mocks.teamsStore },
        { provide: NotificationService, useValue: mocks.notificationService },
        { provide: APP_CONFIG, useValue: { apiUrl: 'http://test.api' } },
        provideRouter([])
      ]
    });

    expect(screen.getByText(/Moins de 18 ans/i)).toBeDefined();
    expect(screen.getAllByText(/Masc\./i).length).toBeGreaterThan(0);
  });

  it('should navigate away if team is not found after loading', async () => {
    const mocks = setupMocks(null);

    await render(TeamView, {
      inputs: { id: 't1' },
      providers: [
        { provide: TeamsStore, useValue: mocks.teamsStore },
        { provide: NotificationService, useValue: mocks.notificationService },
        { provide: Router, useValue: mocks.router },
        { provide: APP_CONFIG, useValue: { apiUrl: 'http://test.api' } },
        provideAnimationsAsync('noop')
      ]
    });

    // S'il n'y a pas de donnée et qu'on ne charge pas, on redirige vers 404
    expect(mocks.router.navigateByUrl).toHaveBeenCalledWith('/404');
  });
});
