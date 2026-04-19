import {render, screen} from '@testing-library/angular';
import {TeamMiniCard} from './team-mini-card';
import {provideRouter} from '@angular/router';
import {describe, it, expect} from 'vitest';

/**
 * Unit tests for TeamMiniCard component.
 */
describe('TeamMiniCard', () => {
  const mockTeam = {
    id: 't1',
    gender: 'Male',
    teamNumber: 2,
    ageGroup: {ageLimit: 18, upperLimit: true}
  };

  it('should render team category and gender', async () => {
    await render(TeamMiniCard, {
      inputs: {team: mockTeam as any},
      providers: [provideRouter([])]
    });

    expect(screen.getByText(/Moins de 18 ans/i)).toBeTruthy();
    expect(screen.getByText(/2/i)).toBeTruthy(); // teamNumber
    expect(screen.getByText(/Masculin/i)).toBeTruthy();
  });

  it('should have a link to the team details page', async () => {
    await render(TeamMiniCard, {
      inputs: {team: mockTeam as any},
      providers: [provideRouter([])]
    });

    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/teams/t1');
  });
});
