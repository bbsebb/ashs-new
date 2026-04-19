import {render, screen} from '@testing-library/angular';
import {describe, expect, it, vi, beforeEach} from 'vitest';
import {StaffsList} from './staffs-list';
import {StaffsStore, LayoutService} from '@shared-api';
import {signal} from '@angular/core';
import {provideRouter} from '@angular/router';
import {NotificationService} from '@shared-ui';
import {of} from 'rxjs';
import {MatTableHarness} from '@angular/material/table/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';

/**
 * Unit tests for StaffsList component (Admin).
 * Verifies the display of the staff table and interaction logic.
 */
describe('StaffsList Component (Admin)', () => {
  const mockStaffs = [
    {id: '1', firstName: 'Jean', lastName: 'Dupont', email: 'jean@test.com', phone: '0102030405', avatarFileName: null},
    {
      id: '2',
      firstName: 'Marie',
      lastName: 'Curie',
      email: 'marie@test.com',
      phone: '0607080910',
      avatarFileName: 'marie.png'
    }
  ];

  const setupMocks = () => {
    return {
      staffsStore: {
        staffsSignal: signal(mockStaffs),
        isLoadingSignal: signal(false),
        errorSignal: signal(null),
        deleteById: vi.fn().mockReturnValue(of(void 0)),
        reload: vi.fn()
      },
      layoutService: {
        isDesktopSignal: signal(true)
      },
      notificationService: {
        show: vi.fn()
      }
    };
  };

  it('should render the table with staff data', async () => {
    const mocks = setupMocks();
    const {fixture} = await render(StaffsList, {
      providers: [
        {provide: StaffsStore, useValue: mocks.staffsStore},
        {provide: LayoutService, useValue: mocks.layoutService},
        {provide: NotificationService, useValue: mocks.notificationService},
        provideRouter([]),
        provideAnimationsAsync('noop')
      ]
    });

    // Check if names are present
    expect(screen.getByText('Jean')).toBeTruthy();
    expect(screen.getByText('Marie')).toBeTruthy();

    // Use Harness to check table rows
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const table = await loader.getHarness(MatTableHarness);
    const rows = await table.getRows();
    expect(rows.length).toBe(2);
  });

  it('should display empty message when no data is available', async () => {
    const mocks = setupMocks();
    mocks.staffsStore.staffsSignal.set([]);

    await render(StaffsList, {
      providers: [
        {provide: StaffsStore, useValue: mocks.staffsStore},
        {provide: LayoutService, useValue: mocks.layoutService},
        {provide: NotificationService, useValue: mocks.notificationService},
        provideRouter([]),
        provideAnimationsAsync('noop')
      ]
    });

    expect(screen.getByText(/Aucun membre de l'encadrement à afficher/i)).toBeTruthy();
  });

  it('should call reload on store when retry is triggered', async () => {
    const mocks = setupMocks();
    const {fixture} = await render(StaffsList, {
      providers: [
        {provide: StaffsStore, useValue: mocks.staffsStore},
        {provide: LayoutService, useValue: mocks.layoutService},
        {provide: NotificationService, useValue: mocks.notificationService},
        provideRouter([]),
        provideAnimationsAsync('noop')
      ]
    });

    // Trigger retry manually
    fixture.componentInstance['retry']();
    expect(mocks.staffsStore.reload).toHaveBeenCalled();
  });
});
