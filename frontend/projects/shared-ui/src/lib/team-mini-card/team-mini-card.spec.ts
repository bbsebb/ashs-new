import {render, screen} from '@testing-library/angular';
import {TeamMiniCard} from '@shared-ui';
import {provideRouter} from '@angular/router';
import {describe, expect, it} from 'vitest';
import {TeamMiniCardViewModel} from '@shared-api';

/**
 * Unit tests for TeamMiniCard component.
 */
describe('TeamMiniCard', () => {
  const mockViewModel: TeamMiniCardViewModel = {
    id: 't1',
    categoryAndNumberLabel: 'Moins de 18 ans 2',
    genderLabel: 'Masculin'
  };

  it('should render team category and gender', async () => {
    await render(TeamMiniCard, {
      componentInputs: {teamMiniCardViewModel: mockViewModel},
      providers: [provideRouter([])]
    });

    expect(screen.getByText(/Moins de 18 ans/i)).toBeTruthy();
    expect(screen.getByText(/2/i)).toBeTruthy(); // teamNumber
    expect(screen.getByText(/Masculin/i)).toBeTruthy();
  });

  it('should have a link to the team details page', async () => {
    await render(TeamMiniCard, {
      componentInputs: {teamMiniCardViewModel: mockViewModel},
      providers: [provideRouter([])]
    });

    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/teams/t1');
  });
});
