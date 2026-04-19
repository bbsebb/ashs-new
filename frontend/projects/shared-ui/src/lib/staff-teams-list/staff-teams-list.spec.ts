import {render, screen} from '@testing-library/angular';
import {StaffTeamsList} from './staff-teams-list';
import {TeamsStore, SeasonsStore} from '@shared-api';
import {signal} from '@angular/core';
import {describe, it, expect, vi} from 'vitest';
import {provideRouter} from '@angular/router';

/**
 * Unit tests for StaffTeamsList component.
 * Verifies that the component correctly enriches team data with season info.
 */
describe('StaffTeamsList', () => {
  const mockTeams = [
    {
      id: 't1',
      seasonId: 's1',
      teamNumber: 1,
      ageGroup: {ageLimit: 18, upperLimit: true},
      staffs: [{staffId: 'staff1', role: 'COACH'}]
    },
    {
      id: 't2',
      seasonId: 's2',
      teamNumber: 1,
      ageGroup: {ageLimit: 15, upperLimit: true},
      staffs: [{staffId: 'staff1', role: 'SUPPORT'}]
    }
  ];

  const mockSeasons = [
    {id: 's1', name: '2024-2025'},
    {id: 's2', name: '2023-2024'}
  ];

  const mockTeamsStore = {
    teamsByStaffId: vi.fn().mockReturnValue(() => [
      {...mockTeams[0], role: 'COACH'},
      {...mockTeams[1], role: 'SUPPORT'}
    ])
  };

  const mockSeasonsStore = {
    seasonsSignal: signal(mockSeasons)
  };

  it('should render the list of teams for a staff member', async () => {
    await render(StaffTeamsList, {
      inputs: {staffIdSignal: 'staff1'},
      providers: [
        {provide: TeamsStore, useValue: mockTeamsStore},
        {provide: SeasonsStore, useValue: mockSeasonsStore},
        provideRouter([])
      ]
    });

    expect(screen.getByText(/2024-2025/i)).toBeTruthy();
    expect(screen.getByText(/Entraineur/i)).toBeTruthy();
    expect(screen.getByText(/2023-2024/i)).toBeTruthy();
    expect(screen.getByText(/Adjoint/i)).toBeTruthy();
  });

  it('should filter teams by season if seasonIdSignal is provided', async () => {
    await render(StaffTeamsList, {
      inputs: {staffIdSignal: 'staff1', seasonIdSignal: 's1'},
      providers: [
        {provide: TeamsStore, useValue: mockTeamsStore},
        {provide: SeasonsStore, useValue: mockSeasonsStore},
        provideRouter([])
      ]
    });

    expect(screen.getByText(/2024-2025/i)).toBeTruthy();
    // Team from season s2 should NOT be visible
    expect(screen.queryByText(/2023-2024/i)).toBeNull();
  });
});
