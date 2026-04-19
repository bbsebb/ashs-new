import {render, screen} from '@testing-library/angular';
import {describe, expect, it, vi} from 'vitest';
import {HallForm} from './hall-form';
import {APP_CONFIG, HallsStore} from '@shared-api';
import {signal} from '@angular/core';
import {Router} from '@angular/router';
import {NotificationService} from '@shared-ui';
import {of} from 'rxjs';
import userEvent from '@testing-library/user-event';
import {MatDialogRef} from '@angular/material/dialog';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';

/**
 * Unit tests for HallForm component.
 */
describe('HallForm Component (Admin)', () => {
  const setupMocks = (existingHall?: any) => {
    return {
      hallsStore: {
        hallById: vi.fn().mockReturnValue(signal(existingHall)),
        createHall: vi.fn().mockReturnValue(of({ id: 'new-id' })),
        updateHall: vi.fn().mockReturnValue(of({ id: 'existing-id' })),
        isLoadingSignal: signal(false)
      },
      notificationService: {
        show: vi.fn()
      },
      router: {
        navigateByUrl: vi.fn().mockReturnValue(Promise.resolve(true))
      }
    };
  };

  it('should render an empty form initially', async () => {
    const mocks = setupMocks();
    await render(HallForm, {
      providers: [
        { provide: HallsStore, useValue: mocks.hallsStore },
        { provide: NotificationService, useValue: mocks.notificationService },
        { provide: Router, useValue: mocks.router },
        {provide: APP_CONFIG, useValue: {apiUrl: 'http://test.api'}},
        {provide: MatDialogRef, useValue: {}},
        provideAnimationsAsync('noop')
      ]
    });

    const submitButton = screen.getByRole('button', { name: /enregistrer/i });
    expect(submitButton).toBeDefined();
  });

  it('should successfully submit the form when all fields are valid', async () => {
    const mocks = setupMocks();
    const user = userEvent.setup();

    await render(HallForm, {
      providers: [
        { provide: HallsStore, useValue: mocks.hallsStore },
        { provide: NotificationService, useValue: mocks.notificationService },
        { provide: Router, useValue: mocks.router },
        {provide: APP_CONFIG, useValue: {apiUrl: 'http://test.api'}},
        {provide: MatDialogRef, useValue: {}},
        provideAnimationsAsync('noop')
      ]
    });

    await user.type(screen.getByLabelText(/Nom de la salle/i), 'Ma Nouvelle Salle');
    await user.type(screen.getByLabelText(/Rue et numéro/i), '10 Rue des Tests');
    await user.type(screen.getByLabelText(/Code postal/i), '67000');
    await user.type(screen.getByLabelText(/Ville/i), 'Strasbourg');
    await user.type(screen.getByLabelText(/Pays/i), 'France');

    const submitButton = screen.getByRole('button', { name: /enregistrer/i });
    await user.click(submitButton);

    expect(mocks.hallsStore.createHall).toHaveBeenCalled();
  });
});
