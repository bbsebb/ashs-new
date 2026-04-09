import {beforeAll, afterAll, afterEach, describe, expect, it, beforeEach} from 'vitest';
import {setupServer} from 'msw/node';
import {http, HttpResponse} from 'msw';
import {TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {TeamsStore} from './teams.store';
import {APP_CONFIG} from '../../configs/app-config';

const mockTeams = [
  { 
    id: 't1', 
    seasonId: 's1', 
    gender: 'Male', 
    name: { teamNumber: 1, ageGroup: { id: 'ag1', name: 'U18', ageLimit: 18, upperLimit: true } },
    photoFileName: null,
    staffs: [],
    trainingSessions: []
  }
];

const server = setupServer(
  http.get('*/api/v1/teams', () => {
    return HttpResponse.json(mockTeams);
  })
);

describe('TeamsStore', () => {
  let store: TeamsStore;

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        TeamsStore,
        { provide: APP_CONFIG, useValue: { apiUrl: 'http://api.test' } }
      ]
    });
    store = TestBed.inject(TeamsStore);
  });

  it('should load teams and initialize teamsSignal', async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(store.teamsSignal()).toHaveLength(1);
    expect(store.teamsSignal()[0].gender).toBe('Male');
  });

  it('should remove staff from all teams when onStaffDeleted is called', async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // On simule une équipe avec un staff
    store['_teamsResource'].update(teams => [
      { ...teams[0], staffs: [{ id: 'vs1', role: 'COACH', staffId: 's1' }] }
    ]);

    expect(store.teamsSignal()[0].staffs).toHaveLength(1);

    // On déclenche la suppression
    store.onStaffDeleted('s1');

    // On vérifie que le staff a été retiré de l'équipe localement
    expect(store.teamsSignal()[0].staffs).toHaveLength(0);
  });
});
