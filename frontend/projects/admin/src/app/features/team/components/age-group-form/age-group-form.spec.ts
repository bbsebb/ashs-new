import {render, screen} from '@testing-library/angular';
import {describe, expect, it, vi} from 'vitest';
import {AgeGroupForm} from './age-group-form';
import {AgeGroupStore, APP_CONFIG} from '@shared-api';
import {Router} from '@angular/router';
import {NotificationService} from '@shared-ui';
import {of} from 'rxjs';
import userEvent from '@testing-library/user-event';
import {MatDialogRef} from '@angular/material/dialog';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';

/**
 * Unit tests for AgeGroupForm component.
 */
describe('AgeGroupForm Component (Admin)', () => {
  const setupMocks = () => {
    return {
      ageGroupStore: {
        createAgeGroup: vi.fn().mockReturnValue(of({ id: 'new-age-group' })),
      },
      notificationService: { show: vi.fn() },
      router: { navigateByUrl: vi.fn().mockReturnValue(Promise.resolve(true)) }
    };
  };

  it('should render the form', async () => {
    const mocks = setupMocks();
    await render(AgeGroupForm, {
      providers: [
        { provide: AgeGroupStore, useValue: mocks.ageGroupStore },
        { provide: NotificationService, useValue: mocks.notificationService },
        { provide: Router, useValue: mocks.router },
        {provide: APP_CONFIG, useValue: {apiUrl: 'http://test.api'}},
        {provide: MatDialogRef, useValue: {}},
        provideAnimationsAsync('noop')
      ]
    });

    expect(screen.getByLabelText(/Limite d'âge/i)).toBeTruthy();
  });

  it('should submit the form and create a new category', async () => {
    const mocks = setupMocks();
    const user = userEvent.setup();

    await render(AgeGroupForm, {
      providers: [
        { provide: AgeGroupStore, useValue: mocks.ageGroupStore },
        { provide: NotificationService, useValue: mocks.notificationService },
        { provide: Router, useValue: mocks.router },
        {provide: APP_CONFIG, useValue: {apiUrl: 'http://test.api'}},
        {provide: MatDialogRef, useValue: {}},
        provideAnimationsAsync('noop')
      ]
    });

    const limitInput = screen.getByLabelText(/Limite d'âge/i);
    await user.clear(limitInput);
    await user.type(limitInput, '18');

    const submitButton = screen.getByRole('button', { name: /enregistrer/i });
    await user.click(submitButton);

    expect(mocks.ageGroupStore.createAgeGroup).toHaveBeenCalled();
  });
});
