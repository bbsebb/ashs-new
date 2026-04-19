import {render, screen} from '@testing-library/angular';
import {describe, expect, it, vi} from 'vitest';
import {HallView} from './hall-view';
import {HallsStore} from '@shared-api';
import {signal} from '@angular/core';
import {provideRouter, Router} from '@angular/router';
import {NotificationService} from '@shared-ui';
import {of} from 'rxjs';
import userEvent from '@testing-library/user-event';
import {Hall} from '@shared-domain';

describe('HallView Component (Admin)', () => {
  const mockHall: Hall = {
    id: '1',
    name: 'Gymnase A',
    addressStreet: '10 Rue',
    addressCity: 'Ville',
    addressPostalCode: '10000',
    addressCountry: 'France'
  };

  const setupMocks = (hallData?: Hall | null) => {
    return {
      hallsStore: {
        hallById: vi.fn().mockReturnValue(signal(hallData)),
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
    mocks.hallsStore.isLoadingSignal.set(true);

    await render(HallView, {
      inputs: {idInputSignal: '1'},
      providers: [
        { provide: HallsStore, useValue: mocks.hallsStore },
        { provide: NotificationService, useValue: mocks.notificationService },
        provideRouter([])
      ]
    });

    expect(screen.getByText(/Chargement de la salle/i)).toBeDefined();
  });

  it('should render error state and allow retry', async () => {
    const mocks = setupMocks(undefined);
    mocks.hallsStore.errorSignal.set(new Error('Network error'));

    const user = userEvent.setup();
    await render(HallView, {
      inputs: {idInputSignal: '1'},
      providers: [
        { provide: HallsStore, useValue: mocks.hallsStore },
        { provide: NotificationService, useValue: mocks.notificationService },
        provideRouter([])
      ]
    });

    expect(screen.getByText(/Impossible de charger salles/i)).toBeDefined();

    const retryBtn = screen.getByRole('button', { name: /réessayer/i });
    await user.click(retryBtn);

    expect(mocks.hallsStore.reload).toHaveBeenCalled();
  });

  it('should render hall details when data is loaded', async () => {
    const mocks = setupMocks(mockHall);

    await render(HallView, {
      inputs: {idInputSignal: '1'},
      providers: [
        { provide: HallsStore, useValue: mocks.hallsStore },
        { provide: NotificationService, useValue: mocks.notificationService },
        provideRouter([])
      ]
    });

    expect(screen.getByText(/Gymnase A/i)).toBeDefined();
    expect(screen.getByText(/Ville/i)).toBeDefined();
  });

  it('should navigate away if hall is not found after loading', async () => {
    const mocks = setupMocks(null);

    await render(HallView, {
      inputs: {idInputSignal: '1'},
      providers: [
        { provide: HallsStore, useValue: mocks.hallsStore },
        { provide: NotificationService, useValue: mocks.notificationService },
        { provide: Router, useValue: mocks.router }
      ]
    });

    // S'il n'y a pas de donnée et qu'on ne charge pas, on redirige vers 404
    expect(mocks.router.navigateByUrl).toHaveBeenCalledWith('/404');
  });
});
