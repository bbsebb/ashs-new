import {render, screen} from '@testing-library/angular';
import {describe, expect, it} from 'vitest';
import {TeamCard} from '@shared-ui';
import {provideRouter} from '@angular/router';
import {TeamCardViewModel} from '@shared-api';

/**
 * Unit tests for TeamCard component.
 */
describe('TeamCard Component', () => {
  const mockViewModel: TeamCardViewModel = {
    id: 't1',
    photoUrl: null,
    categoryLabelShort: '-18 ans',
    categoryLabelLong: 'Moins de 18 ans',
    gender: 'Male',
    teamNumber: 1,
    staffs: [
      {
        id: 's1',
        fullName: 'Jean Dupont',
        roleLabel: 'Entraineur',
        role: 'COACH',
        avatarUrl: null
      }
    ],
    trainingSessions: [
      {
        dayOfWeek: 'MONDAY',
        startTime: new Date(2024, 1, 1, 18, 0),
        endTime: new Date(2024, 1, 1, 20, 0),
        hallName: 'Palais des Sports',
        hallId: 'h1'
      }
    ]
  };

  it('should render team details and enriched data from ViewModel', async () => {
    await render(TeamCard, {
      componentInputs: {teamCardViewModel: mockViewModel},
      providers: [
        provideRouter([])
      ]
    });

    // Category and Gender
    expect(screen.getByText(/Moins de 18 ans/)).toBeDefined();
    expect(screen.getByText('Masc.')).toBeDefined();

    // Enriched Staff
    expect(screen.getByText('Jean Dupont')).toBeDefined();
    expect(screen.getByText('Entraineur')).toBeDefined();

    // Enriched Hall
    expect(screen.getByText(/Palais des Sports/)).toBeDefined();
    expect(screen.getByText(/18:00 - 20:00/)).toBeDefined();
  });

  it('should render empty states when no staff or sessions', async () => {
    const emptyViewModel: TeamCardViewModel = {
      ...mockViewModel,
      staffs: [],
      trainingSessions: []
    };

    await render(TeamCard, {
      componentInputs: {teamCardViewModel: emptyViewModel},
      providers: [provideRouter([])]
    });

    expect(screen.getByText(/no staff assigned/i)).toBeDefined();
    expect(screen.getByText(/no sessions scheduled/i)).toBeDefined();
  });
});
