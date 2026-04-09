import {render, screen} from '@testing-library/angular';
import {describe, expect, it, vi} from 'vitest';
import {AgeGroupForm} from './age-group-form';
import {AgeGroupStore, APP_CONFIG} from '@shared-api';
import {signal} from '@angular/core';
import {Router, provideRouter} from '@angular/router';
import {NotificationService} from '@shared-ui';
import {of} from 'rxjs';
import userEvent from '@testing-library/user-event';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';

describe('AgeGroupForm Component (Admin) - Exhaustive', () => {
  const setupMocks = () => {
    return {
      ageGroupStore: {
        createAgeGroup: vi.fn().mockReturnValue(of({ id: 'new-age-group' })),
      },
      notificationService: { show: vi.fn() },
      router: { navigateByUrl: vi.fn().mockReturnValue(Promise.resolve(true)) }
    };
  };

  it('should render form with default values', async () => {
    const mocks = setupMocks();
    await render(AgeGroupForm, {
      providers: [
        { provide: AgeGroupStore, useValue: mocks.ageGroupStore },
        { provide: NotificationService, useValue: mocks.notificationService },
        { provide: Router, useValue: mocks.router },
        { provide: APP_CONFIG, useValue: { apiUrl: 'http://test.api' } }
      ]
    });

    // Valeur par défaut dans le constructeur est 0 pour la limite
    const limitInput = screen.getByLabelText(/Limite d'âge/i) as HTMLInputElement;
    expect(limitInput.value).toBe('0');
  });

  it('should submit the form and create a new category', async () => {
    const mocks = setupMocks();
    const user = userEvent.setup();

    await render(AgeGroupForm, {
      providers: [
        { provide: AgeGroupStore, useValue: mocks.ageGroupStore },
        { provide: NotificationService, useValue: mocks.notificationService },
        { provide: Router, useValue: mocks.router },
        { provide: APP_CONFIG, useValue: { apiUrl: 'http://test.api' } }
      ]
    });

    // Changer la valeur d'âge
    const limitInput = screen.getByLabelText(/Limite d'âge/i);
    await user.clear(limitInput);
    await user.type(limitInput, '18');

    // Soumission
    const submitButton = screen.getByRole('button', { name: /enregistrer/i });
    await user.click(submitButton);

    // Vérification de l'appel (on vérifie que ageLimit a bien été parsé et transmis)
    expect(mocks.ageGroupStore.createAgeGroup).toHaveBeenCalledWith(
      expect.objectContaining({ ageLimit: 18 })
    );

    // Vérification de la redirection
    expect(mocks.router.navigateByUrl).toHaveBeenCalledWith('/teams');
  });
});
