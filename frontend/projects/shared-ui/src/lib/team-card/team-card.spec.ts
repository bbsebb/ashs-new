import {render, screen} from '@testing-library/angular';
import {describe, expect, it, vi} from 'vitest';
import {TeamCard} from './team-card';
import {Team} from '@shared-domain';
import {signal} from '@angular/core';
import {HallsStore, StaffsStore, APP_CONFIG} from '@shared-api';
import {provideRouter} from '@angular/router';

describe('TeamCard Component', () => {
  const mockTeam: Team = {
    id: 't1',
    seasonId: 's1',
    gender: 'Male',
    teamNumber: 1,
    photoFileName: null,
    ageGroup: { id: 'ag1', name: 'U18', ageLimit: 18, upperLimit: true },
    staffs: [
      { id: 'ts1', role: 'COACH', staffId: 's1' }
    ],
    trainingSessions: [
      { id: 'tr1', hallId: 'h1', dayOfWeek: 'MONDAY', timeSlot: { startTime: new Date(2024, 1, 1, 18, 0), endTime: new Date(2024, 1, 1, 20, 0) } }
    ]
  };

  const mockStaffsStore = {
    staffsSignal: signal([{ id: 's1', firstName: 'Jean', lastName: 'Dupont', avatarFileName: null }])
  };

  const mockHallsStore = {
    hallsSignal: signal([{ id: 'h1', name: 'Palais des Sports' }])
  };

  it('should render team details and enriched data from stores', async () => {
    await render(TeamCard, {
      componentInputs: {
        team: mockTeam
      },
      providers: [
        { provide: StaffsStore, useValue: mockStaffsStore },
        { provide: HallsStore, useValue: mockHallsStore },
        { provide: APP_CONFIG, useValue: { apiUrl: 'http://test.api' } },
        provideRouter([]) // For the routerLink in StaffMiniCard
      ]
    });

    // Titre et catégorie
    expect(screen.getByText(/Moins de 18 ans/)).toBeDefined();
    expect(screen.getByText('Masc.')).toBeDefined(); // Grâce au GenderPipe

    // Données enrichies : Staff
    expect(screen.getByText('Jean Dupont')).toBeDefined();
    expect(screen.getByText('Entraineur')).toBeDefined(); // Grâce au RoleStaffPipe

    // Données enrichies : Salle d'entraînement
    expect(screen.getByText(/Palais des Sports/)).toBeDefined();
  });
});
