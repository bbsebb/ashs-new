import {beforeAll, afterAll, afterEach, describe, expect, it, beforeEach, vi} from 'vitest';
import {setupServer} from 'msw/node';
import {http, HttpResponse} from 'msw';
import {TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {StaffsStore} from './staffs.store';
import {TeamsStore} from '../team/teams.store';
import {APP_CONFIG} from '../../configs/app-config';
import {firstValueFrom} from 'rxjs';

const mockStaffs = [
  { id: 's1', firstName: 'Jean', lastName: 'Dupont', email: 'jean@test.com', phone: '0102030405', avatarFileName: null },
  { id: 's2', firstName: 'Marie', lastName: 'Curie', email: 'marie@test.com', phone: '0607080910', avatarFileName: 'marie.png' }
];

const server = setupServer(
  http.get('*/api/v1/staffs', () => {
    return HttpResponse.json(mockStaffs);
  }),
  http.delete('*/api/v1/staffs/:id', () => {
    return new HttpResponse(null, { status: 204 });
  })
);

describe('StaffsStore', () => {
  let store: StaffsStore;
  let teamsStore: TeamsStore;

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  beforeEach(() => {
    const mockTeamsStore = {
      onStaffDeleted: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        StaffsStore,
        { provide: TeamsStore, useValue: mockTeamsStore },
        { provide: APP_CONFIG, useValue: { apiUrl: 'http://api.test' } }
      ]
    });
    store = TestBed.inject(StaffsStore);
    teamsStore = TestBed.inject(TeamsStore);
  });

  it('should load staffs and initialize staffsSignal', async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(store.staffsSignal()).toHaveLength(2);
    expect(store.staffsSignal()[0].firstName).toBe('Jean');
  });

  it('should call teamsStore.onStaffDeleted when a staff is deleted', async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const staffIdToDelete = 's1';
    // ATTENTION : On doit attendre la fin du delete avant de vérifier le cache
    await firstValueFrom(store.deleteById(staffIdToDelete));

    // On vérifie que le store de staff a mis à jour son cache
    expect(store.staffsSignal().some(s => s.id === staffIdToDelete)).toBe(false);
    
    // On vérifie que l'appel de synchronisation vers TeamsStore a été fait
    expect(teamsStore.onStaffDeleted).toHaveBeenCalledWith(staffIdToDelete);
  });
});
