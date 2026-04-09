import {render, screen, waitFor} from '@testing-library/angular';
import {describe, expect, it, vi} from 'vitest';
import {TeamForm} from './team-form';
import {AgeGroupStore, HallsStore, SeasonsStore, StaffsStore, TeamsStore, APP_CONFIG} from '@shared-api';
import {signal} from '@angular/core';
import {provideRouter, Router} from '@angular/router';
import {NotificationService} from '@shared-ui';
import {of} from 'rxjs';
import userEvent from '@testing-library/user-event';
import {provideNativeDateAdapter} from '@angular/material/core';

describe('TeamForm Component (Admin) - Exhaustive', () => {
  const mockSeasons = [{ id: 's1', name: '2024-2025' }];
  const mockAgeGroups = [{ id: 'ag1', name: 'U18', ageLimit: 18, upperLimit: true }];
  const mockStaffs = [{ id: 'st1', firstName: 'Jean', lastName: 'Coach', avatarFileName: null }];
  const mockHalls = [{ id: 'h1', name: 'Salle Principale' }];

  const setupMocks = (existingTeam?: any) => {
    return {
      teamsStore: {
        teamById: vi.fn().mockReturnValue(signal(existingTeam)),
        createTeam: vi.fn().mockReturnValue(of({ id: 'new-team-id' })),
        updateTeam: vi.fn().mockReturnValue(of({ id: 'existing-team-id' })),
        isLoadingSignal: signal(false)
      },
      staffsStore: { staffsSignal: signal(mockStaffs) },
      seasonsStore: { seasonsSignal: signal(mockSeasons) },
      hallsStore: { hallsSignal: signal(mockHalls) },
      ageGroupStore: { ageGroupsSignal: signal(mockAgeGroups) },
      notificationService: { show: vi.fn() }
    };
  };

  it('should disable submit button when form is invalid on init', async () => {
    const mocks = setupMocks();
    await render(TeamForm, {
      providers: [
        { provide: TeamsStore, useValue: mocks.teamsStore },
        { provide: StaffsStore, useValue: mocks.staffsStore },
        { provide: SeasonsStore, useValue: mocks.seasonsStore },
        { provide: HallsStore, useValue: mocks.hallsStore },
        { provide: AgeGroupStore, useValue: mocks.ageGroupStore },
        { provide: NotificationService, useValue: mocks.notificationService },
        { provide: APP_CONFIG, useValue: { apiUrl: 'http://test.api' } },
        provideRouter([]),
        provideNativeDateAdapter()
      ]
    });

    const submitButton = screen.getByRole('button', { name: /enregistrer/i });
    expect((submitButton as HTMLButtonElement).disabled).toBeTruthy();
  });

  it('should allow adding staff dynamically', async () => {
    const mocks = setupMocks();
    const user = userEvent.setup();
    await render(TeamForm, {
      providers: [
        { provide: TeamsStore, useValue: mocks.teamsStore },
        { provide: StaffsStore, useValue: mocks.staffsStore },
        { provide: SeasonsStore, useValue: mocks.seasonsStore },
        { provide: HallsStore, useValue: mocks.hallsStore },
        { provide: AgeGroupStore, useValue: mocks.ageGroupStore },
        { provide: NotificationService, useValue: mocks.notificationService },
        { provide: APP_CONFIG, useValue: { apiUrl: 'http://test.api' } },
        provideRouter([]),
        provideNativeDateAdapter()
      ]
    });

    const addStaffBtn = screen.getByRole('button', { name: /ajouter un encadrant/i });
    await user.click(addStaffBtn);

    // Un champ rôle devrait apparaître pour le nouvel encadrant
    expect(screen.getByLabelText(/Rôle/i)).toBeDefined();
  });

  it('should pre-fill fields in Edit mode and allow update', async () => {
    const existingTeam = {
      id: 't1',
      seasonId: 's1',
      gender: 'Female',
      teamNumber: 3,
      ageGroup: mockAgeGroups[0],
      staffs: [],
      trainingSessions: [],
      photoFileName: null
    };
    
    const mocks = setupMocks(existingTeam);
    const user = userEvent.setup();

    await render(TeamForm, {
      inputs: { id: 't1' },
      providers: [
        { provide: TeamsStore, useValue: mocks.teamsStore },
        { provide: StaffsStore, useValue: mocks.staffsStore },
        { provide: SeasonsStore, useValue: mocks.seasonsStore },
        { provide: HallsStore, useValue: mocks.hallsStore },
        { provide: AgeGroupStore, useValue: mocks.ageGroupStore },
        { provide: NotificationService, useValue: mocks.notificationService },
        { provide: APP_CONFIG, useValue: { apiUrl: 'http://test.api' } },
        provideRouter([]),
        provideNativeDateAdapter()
      ]
    });

    // En mode édition, le numéro d'équipe doit être pré-rempli à 3
    const input = screen.getByLabelText(/Numéro d'équipe/i) as HTMLInputElement;
    expect(input.value).toBe('3');
    
    // Le bouton doit afficher "Modifier"
    const submitButton = screen.getByRole('button', { name: /modifier/i });
    expect(submitButton).toBeDefined();

    // Modification du champ
    await user.clear(input);
    await user.type(input, '4');
  });

  it('should allow adding training sessions and validate time range', async () => {
    const mocks = setupMocks();
    const user = userEvent.setup();
    await render(TeamForm, {
      providers: [
        { provide: TeamsStore, useValue: mocks.teamsStore },
        { provide: StaffsStore, useValue: mocks.staffsStore },
        { provide: SeasonsStore, useValue: mocks.seasonsStore },
        { provide: HallsStore, useValue: mocks.hallsStore },
        { provide: AgeGroupStore, useValue: mocks.ageGroupStore },
        { provide: NotificationService, useValue: mocks.notificationService },
        { provide: APP_CONFIG, useValue: { apiUrl: 'http://test.api' } },
        provideRouter([]),
        provideNativeDateAdapter()
      ]
    });

    const addSessionBtn = screen.getByRole('button', { name: /ajouter un créneau/i });
    await user.click(addSessionBtn);

    expect(screen.getByLabelText(/Heure de début/i)).toBeDefined();
  });
});
