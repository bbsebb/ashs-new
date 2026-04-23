import {render, screen} from '@testing-library/angular';
import {describe, expect, it} from 'vitest';
import {StaffCard} from '@shared-ui';
import {provideRouter} from '@angular/router';
import {StaffCardViewModel} from '@shared-api';

describe('StaffCard Component', () => {
  const mockViewModel: StaffCardViewModel = {
    id: 's1',
    firstName: 'Jean',
    lastName: 'Dupont',
    fullName: 'Jean Dupont',
    email: 'jean.dupont@test.com',
    phone: '0612345678',
    avatarUrl: null,
    assignedTeams: []
  };

  it('should render staff name, email, and phone correctly', async () => {
    await render(StaffCard, {
      componentInputs: {
        staffCardViewModel: mockViewModel
      },
      providers: [
        provideRouter([])
      ]
    });

    // Titre
    expect(screen.getByText('Jean Dupont')).toBeDefined();

    // Informations de contact
    expect(screen.getByText('jean.dupont@test.com')).toBeDefined();
    expect(screen.getByText('0612345678')).toBeDefined();
  });

  it('should render assigned teams via StaffTeamsList', async () => {
    const viewModelWithTeams: StaffCardViewModel = {
      ...mockViewModel,
      assignedTeams: [
        {id: 't1', seasonName: '2024-2025', teamLabel: '-18 ans 1', roleLabel: 'Coach'}
      ]
    };

    await render(StaffCard, {
      componentInputs: {staffCardViewModel: viewModelWithTeams},
      providers: [provideRouter([])]
    });

    expect(screen.getByText(/historique des équipes/i)).toBeDefined();
    expect(screen.getByText('-18 ans 1')).toBeDefined();
    expect(screen.getByText('Coach')).toBeDefined();
  });
});
