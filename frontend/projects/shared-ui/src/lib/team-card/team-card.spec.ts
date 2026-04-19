import {render, screen} from '@testing-library/angular';
import {describe, expect, it, vi} from 'vitest';
import {TeamCard} from './team-card';
import {Team} from '@shared-domain';
import {signal} from '@angular/core';
import {HallsStore, StaffsStore, APP_CONFIG} from '@shared-api';
import {provideRouter} from '@angular/router';

/**
 * Unit tests for TeamCard component.
 * Verifies data enrichment from stores and signal-based display.
 */
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
      {
        id: 'tr1',
        hallId: 'h1',
        dayOfWeek: 'MONDAY',
        timeSlot: {
          startTime: new Date(2024, 1, 1, 18, 0),
          endTime: new Date(2024, 1, 1, 20, 0)
        }
      }
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
      componentProperties: {team: mockTeam} as any,
      providers: [
        { provide: StaffsStore, useValue: mockStaffsStore },
        { provide: HallsStore, useValue: mockHallsStore },
        { provide: APP_CONFIG, useValue: { apiUrl: 'http://test.api' } },
        provideRouter([])
      ]
    });

    // Category and Gender (via pipes)
    expect(screen.getByText(/Moins de 18 ans/)).toBeDefined();
    expect(screen.getByText('Masc.')).toBeDefined();

    // Enriched Staff
    expect(screen.getByText('Jean Dupont')).toBeDefined();
    expect(screen.getByText('Entraineur')).toBeDefined();

    // Enriched Hall
    expect(screen.getByText(/Palais des Sports/)).toBeDefined();
  });
});
