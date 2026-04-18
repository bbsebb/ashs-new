import {render, screen} from '@testing-library/angular';
import {describe, expect, it, vi} from 'vitest';
import {HallForm} from './hall-form';
import {APP_CONFIG, HallsStore} from '@shared-api';
import {signal} from '@angular/core';
import {Router} from '@angular/router';
import {NotificationService} from '@shared-ui';
import {of} from 'rxjs';
import userEvent from '@testing-library/user-event';

describe('HallForm Component (Admin) - Exhaustive', () => {
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

  it('should render an empty form and disable submit button initially', async () => {
    const mocks = setupMocks();
    await render(HallForm, {
      providers: [
        { provide: HallsStore, useValue: mocks.hallsStore },
        { provide: NotificationService, useValue: mocks.notificationService },
        { provide: Router, useValue: mocks.router },
        { provide: APP_CONFIG, useValue: { apiUrl: 'http://test.api' } }
      ]
    });

    const submitButton = screen.getByRole('button', { name: /enregistrer/i });
    expect((submitButton as HTMLButtonElement).disabled).toBeTruthy();
  });

  it('should show validation errors when leaving a required field empty', async () => {
    const mocks = setupMocks();
    const user = userEvent.setup();

    await render(HallForm, {
      providers: [
        { provide: HallsStore, useValue: mocks.hallsStore },
        { provide: NotificationService, useValue: mocks.notificationService },
        { provide: Router, useValue: mocks.router },
        { provide: APP_CONFIG, useValue: { apiUrl: 'http://test.api' } }
      ]
    });

    const nameInput = screen.getByLabelText(/^Nom de la salle$/i);

    // On clique dedans puis on clique ailleurs (touched)
    await user.click(nameInput);
    await user.click(document.body);

    // L'erreur doit apparaître
    expect(screen.getByText(/Le nom de la salle est requis/i)).toBeDefined();
  });

  it('should successfully submit the form when all fields are valid', async () => {
    const mocks = setupMocks();
    const user = userEvent.setup();

    await render(HallForm, {
      providers: [
        { provide: HallsStore, useValue: mocks.hallsStore },
        { provide: NotificationService, useValue: mocks.notificationService },
        { provide: Router, useValue: mocks.router },
        { provide: APP_CONFIG, useValue: { apiUrl: 'http://test.api' } }
      ]
    });

    await user.type(screen.getByLabelText(/^Nom de la salle$/i), 'Ma Nouvelle Salle');
    await user.type(screen.getByLabelText(/^Rue et numéro$/i), '10 Rue des Tests');
    await user.type(screen.getByLabelText(/^Code postal$/i), '67000');
    await user.type(screen.getByLabelText(/^Ville$/i), 'Strasbourg');
    await user.type(screen.getByLabelText(/^Pays$/i), 'France');

    const submitButton = screen.getByRole('button', { name: /enregistrer/i });

    // Le bouton doit être activé
    expect((submitButton as HTMLButtonElement).disabled).toBeFalsy();

    await user.click(submitButton);

    expect(mocks.hallsStore.createHall).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Ma Nouvelle Salle',
      addressCity: 'Strasbourg'
    }));
    expect(mocks.router.navigateByUrl).toHaveBeenCalledWith('/halls/new-id');
  });

  it('should pre-fill the form and call update when an existing hall is provided', async () => {
    const existingHall = {
      id: 'existing-id',
      name: 'Ancienne Salle',
      addressStreet: '1 Vieille Rue',
      addressCity: 'Paris',
      addressPostalCode: '75000',
      addressCountry: 'France'
    };

    const mocks = setupMocks(existingHall);
    const user = userEvent.setup();

    await render(HallForm, {
      inputs: { id: 'existing-id' },
      providers: [
        { provide: HallsStore, useValue: mocks.hallsStore },
        { provide: NotificationService, useValue: mocks.notificationService },
        { provide: Router, useValue: mocks.router },
        { provide: APP_CONFIG, useValue: { apiUrl: 'http://test.api' } }
      ]
    });

    const nameInput = screen.getByLabelText(/^Nom de la salle$/i) as HTMLInputElement;
    expect(nameInput.value).toBe('Ancienne Salle');

    const submitButton = screen.getByRole('button', { name: /modifier/i });

    // On modifie une valeur
    await user.clear(nameInput);
    await user.type(nameInput, 'Salle Renommée');

    await user.click(submitButton);

    // On vérifie que la méthode UPDATE a été appelée (et non CREATE)
    expect(mocks.hallsStore.updateHall).toHaveBeenCalledWith('existing-id', expect.objectContaining({
      name: 'Salle Renommée',
      addressCity: 'Paris' // Le reste ne change pas
    }));
  });
});
