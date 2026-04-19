import {render, screen} from '@testing-library/angular';
import {describe, expect, it, vi} from 'vitest';
import {TeamsList} from './teams-list';
import {LayoutService, SeasonsStore, TeamsStore} from '@shared-api';
import {signal} from '@angular/core';
import {provideRouter} from '@angular/router';
import {NotificationService} from '@shared-ui';
import {of} from 'rxjs';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';

/**
 * Unit tests for TeamsList component (Admin).
 */
describe('TeamsList Component (Admin)', () => {
  const mockTeams = [
    {
      id: '1',
      seasonId: 's1',
      gender: 'Male',
      teamNumber: 1,
      ageGroup: {id: 'ag1', name: 'U18', ageLimit: 18, upperLimit: true},
      staffs: [],
      trainingSessions: []
    },
    {
      id: '2',
      seasonId: 's1',
      gender: 'Female',
      teamNumber: 1,
      ageGroup: {id: 'ag2', name: 'U15', ageLimit: 15, upperLimit: true},
      staffs: [],
      trainingSessions: []
    }
  ];

  const mockSeasons = [
    {id: 's1', name: '2024-2025', isCurrent: true}
  ];

  const setupMocks = () => {
    return {
      teamsStore: {
        teamsSignal: signal(mockTeams),
        isLoadingSignal: signal(false),
        errorSignal: signal(null),
        deleteById: vi.fn().mockReturnValue(of(void 0)),
        reload: vi.fn()
      },
      seasonsStore: {
        seasonsSignal: signal(mockSeasons),
        currentSeasonSignal: signal(mockSeasons[0]),
        isLoadingSignal: signal(false),
        errorSignal: signal(null),
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

  it('should render table with teams data', async () => {
    const mocks = setupMocks();
    await render(TeamsList, {
      providers: [
        {provide: TeamsStore, useValue: mocks.teamsStore},
        {provide: SeasonsStore, useValue: mocks.seasonsStore},
        {provide: LayoutService, useValue: mocks.layoutService},
        {provide: NotificationService, useValue: mocks.notificationService},
        provideRouter([]),
        provideAnimationsAsync('noop')
      ]
    });

    // Check if team categories are present (U18, U15)
    expect(screen.getByText(/U18/i)).toBeDefined();
    expect(screen.getByText(/U15/i)).toBeDefined();
  });
});
