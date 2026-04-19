import {render, screen} from '@testing-library/angular';
import {describe, expect, it, vi} from 'vitest';
import {StaffsList} from './staffs-list';
import {StaffsStore, APP_CONFIG, SeasonsStore, TeamsStore} from '@shared-api';
import {signal} from '@angular/core';
import {provideRouter} from '@angular/router';

/**
 * Unit tests for StaffsList component (Public).
 */
describe('StaffsList Component (Public)', () => {
  it('should render public staff grid', async () => {
    const mockStaffs = [{ id: 's1', firstName: 'Jean', lastName: 'Dupont', avatarFileName: null }];

    const mockStaffsStore = {
      staffsSignal: signal(mockStaffs),
      isLoadingSignal: signal(false),
      errorSignal: signal(null),
      reload: vi.fn()
    };

    const mockSeasonsStore = {
      seasonsSignal: signal([]),
      currentSeasonSignal: signal(null),
      isLoadingSignal: signal(false),
      errorSignal: signal(null),
      reload: vi.fn()
    };

    const mockTeamsStore = {
      teamsSignal: signal([]),
      isLoadingSignal: signal(false),
      errorSignal: signal(null),
      reload: vi.fn()
    };

    await render(StaffsList, {
      providers: [
        { provide: StaffsStore, useValue: mockStaffsStore },
        {provide: SeasonsStore, useValue: mockSeasonsStore},
        {provide: TeamsStore, useValue: mockTeamsStore},
        {provide: APP_CONFIG, useValue: {apiUrl: 'http://test.api'}},
        provideRouter([])
      ]
    });

    // The title in template is "Encadrement"
    expect(screen.getByText(/Encadrement/i)).toBeDefined();
  });
});
