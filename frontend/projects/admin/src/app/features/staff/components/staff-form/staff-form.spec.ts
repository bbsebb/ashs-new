import {render, screen} from '@testing-library/angular';
import {describe, expect, it, vi} from 'vitest';
import {StaffForm} from './staff-form';
import {APP_CONFIG, StaffsStore} from '@shared-api';
import {signal} from '@angular/core';
import {provideRouter, Router, ActivatedRoute} from '@angular/router';
import {NotificationService} from '@shared-ui';
import {of} from 'rxjs';
import userEvent from '@testing-library/user-event';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {ImageService} from '@shared-api';
import {provideNativeDateAdapter} from '@angular/material/core';

describe('StaffForm Component (Admin)', () => {
  const setupMocks = () => {
    return {
      staffsStore: {
        staffsSignal: signal([]),
        staffById: vi.fn().mockReturnValue(signal(undefined)),
        createStaff: vi.fn().mockReturnValue(of({ id: 'new-staff' })),
        isLoadingSignal: signal(false)
      },
      notificationService: {
        show: vi.fn()
      },
      router: {
        navigateByUrl: vi.fn().mockReturnValue(Promise.resolve(true))
      },
      activatedRoute: {
        snapshot: { params: {} }
      }
    };
  };

  it('should create a new staff member', async () => {
    const mocks = setupMocks();
    const user = userEvent.setup();

    await render(StaffForm, {
      providers: [
        { provide: StaffsStore, useValue: mocks.staffsStore },
        { provide: NotificationService, useValue: mocks.notificationService },
        { provide: ImageService, useValue: { createImageSourceUrl: vi.fn().mockReturnValue('dummy.png') } },
        { provide: Router, useValue: mocks.router },
        { provide: ActivatedRoute, useValue: mocks.activatedRoute },
        { provide: APP_CONFIG, useValue: { apiUrl: 'http://test.api' } },
        provideAnimationsAsync('noop'),
        provideNativeDateAdapter()
      ]
    });

    await user.type(screen.getByLabelText(/^Prénom$/i), 'Jean');
    await user.type(screen.getByLabelText(/^Nom$/i), 'Dupont');
    await user.type(screen.getByLabelText(/^Email$/i), 'jean@test.com');
    await user.type(screen.getByLabelText(/^Téléphone$/i), '0102030405');

    const submitButton = screen.getByRole('button', { name: /enregistrer/i });
    await user.click(submitButton);

    expect(mocks.staffsStore.createStaff).toHaveBeenCalled();
    expect(mocks.router.navigateByUrl).toHaveBeenCalledWith('/staffs/new-staff');
  });
});
