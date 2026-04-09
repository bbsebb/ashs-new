import {render, screen} from '@testing-library/angular';
import {describe, expect, it, vi} from 'vitest';
import {TeamsList} from './teams-list';
import {SeasonsStore, TeamsStore, APP_CONFIG} from '@shared-api';
import {signal} from '@angular/core';
import {provideRouter} from '@angular/router';

describe('TeamsList Public Component', () => {
  const mockTeams = [
    { id: 't1', seasonId: 's1', gender: 'Male', teamNumber: 1, ageGroup: { name: 'U18', ageLimit: 18, upperLimit: true } },
    { id: 't2', seasonId: 's2', gender: 'Female', teamNumber: 1, ageGroup: { name: 'U15', ageLimit: 15, upperLimit: true } }
  ];

  const mockSeasons = [
    { id: 's1', name: '2023-2024', isCurrent: false },
    { id: 's2', name: '2024-2025', isCurrent: true }
  ];

  const setupMockStores = () => {
    return {
      teamsStore: {
        teamsSignal: signal(mockTeams),
        isLoadingSignal: signal(false),
        errorSignal: signal(undefined),
        reload: vi.fn()
      },
      seasonsStore: {
        seasonsSignal: signal(mockSeasons),
        isLoadingSignal: signal(false),
        errorSignal: signal(undefined),
        reload: vi.fn()
      }
    };
  };

  it('should auto-select the current season and filter teams accordingly', async () => {
    const mocks = setupMockStores();

    await render(TeamsList, {
      providers: [
        { provide: TeamsStore, useValue: mocks.teamsStore },
        { provide: SeasonsStore, useValue: mocks.seasonsStore },
        { provide: APP_CONFIG, useValue: { apiUrl: 'http://test.api' } },
        provideRouter([])
      ]
    });

    // Seulement l'équipe de la saison 2 devrait être visible (Fém. U15)
    expect(screen.getByText(/Moins de 15 ans/)).toBeDefined();
    
    // L'équipe U18 ne devrait pas être là
    expect(screen.queryByText(/Moins de 18 ans/)).toBeNull();
  });
});
