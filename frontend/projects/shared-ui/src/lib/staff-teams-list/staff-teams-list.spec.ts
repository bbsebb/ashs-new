import {render, screen} from '@testing-library/angular';
import {StaffTeamsList} from '@shared-ui';
import {describe, expect, it} from 'vitest';
import {provideRouter} from '@angular/router';
import {StaffTeamViewModel} from '@shared-api';

/**
 * Unit tests for StaffTeamsList component.
 */
describe('StaffTeamsList', () => {
  const mockTeams: StaffTeamViewModel[] = [
    {
      id: 't1',
      seasonName: '2024-2025',
      teamLabel: '-18 ans 1',
      roleLabel: 'Entraineur'
    },
    {
      id: 't2',
      seasonName: '2023-2024',
      teamLabel: '-15 ans 1',
      roleLabel: 'Adjoint'
    }
  ];

  it('should render the list of teams for a staff member', async () => {
    await render(StaffTeamsList, {
      componentInputs: {staffTeams: mockTeams},
      providers: [
        provideRouter([])
      ]
    });

    expect(screen.getByText(/2024-2025/i)).toBeTruthy();
    expect(screen.getByText(/Entraineur/i)).toBeTruthy();
    expect(screen.getByText(/2023-2024/i)).toBeTruthy();
    expect(screen.getByText(/Adjoint/i)).toBeTruthy();
  });

  it('should hide season label if showSeason is false', async () => {
    await render(StaffTeamsList, {
      componentInputs: {staffTeams: mockTeams, showSeason: false},
      providers: [
        provideRouter([])
      ]
    });

    expect(screen.queryByText(/2024-2025/i)).toBeNull();
  });
});
