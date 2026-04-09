import {render, screen} from '@testing-library/angular';
import {describe, expect, it, vi} from 'vitest';
import {StaffView} from './staff-view';
import {StaffsStore, APP_CONFIG} from '@shared-api';
import {signal} from '@angular/core';
import {provideRouter, Router} from '@angular/router';
import {NotificationService} from '@shared-ui';
import {of} from 'rxjs';
import userEvent from '@testing-library/user-event';
import {Staff} from '@shared-domain';

describe('StaffView Component (Admin)', () => {
  const mockStaff: Staff = {
    id: 's1',
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean@test.com',
    phone: '0102030405',
    avatarFileName: null
  };

  const setupMocks = (staffData?: Staff | null) => {
    return {
      staffsStore: {
        staffById: vi.fn().mockReturnValue(signal(staffData)),
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
    mocks.staffsStore.isLoadingSignal.set(true);

    await render(StaffView, {
      componentInputs: { id: 's1' },
      providers: [
        { provide: StaffsStore, useValue: mocks.staffsStore },
        { provide: NotificationService, useValue: mocks.notificationService },
        { provide: APP_CONFIG, useValue: { apiUrl: 'http://test.api' } },
        provideRouter([])
      ]
    });

    expect(screen.getByText(/Chargement du membre/i)).toBeDefined();
  });

  it('should render error state and allow retry', async () => {
    const mocks = setupMocks(undefined);
    mocks.staffsStore.errorSignal.set(new Error('Network error'));

    const user = userEvent.setup();
    await render(StaffView, {
      componentInputs: { id: 's1' },
      providers: [
        { provide: StaffsStore, useValue: mocks.staffsStore },
        { provide: NotificationService, useValue: mocks.notificationService },
        { provide: APP_CONFIG, useValue: { apiUrl: 'http://test.api' } },
        provideRouter([])
      ]
    });

    expect(screen.getByText(/Impossible de charger encadrant/i)).toBeDefined();
    
    const retryBtn = screen.getByRole('button', { name: /réessayer/i });
    await user.click(retryBtn);

    expect(mocks.staffsStore.reload).toHaveBeenCalled();
  });

  it('should render staff details when data is loaded', async () => {
    const mocks = setupMocks(mockStaff);

    await render(StaffView, {
      componentInputs: { id: 's1' },
      providers: [
        { provide: StaffsStore, useValue: mocks.staffsStore },
        { provide: NotificationService, useValue: mocks.notificationService },
        { provide: APP_CONFIG, useValue: { apiUrl: 'http://test.api' } },
        provideRouter([])
      ]
    });

    expect(screen.getByText('Jean Dupont')).toBeDefined();
    expect(screen.getByText('jean@test.com')).toBeDefined();
  });

  it('should navigate away if staff is not found after loading', async () => {
    const mocks = setupMocks(null);

    await render(StaffView, {
      componentInputs: { id: 's1' },
      providers: [
        { provide: StaffsStore, useValue: mocks.staffsStore },
        { provide: NotificationService, useValue: mocks.notificationService },
        { provide: Router, useValue: mocks.router }
      ]
    });

    expect(mocks.router.navigateByUrl).toHaveBeenCalledWith('/404');
  });
});
