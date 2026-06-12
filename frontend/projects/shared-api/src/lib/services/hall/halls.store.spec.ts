import {beforeAll, afterAll, afterEach, describe, expect, it} from 'vitest';
import {setupServer} from 'msw/node';
import {http, HttpResponse} from 'msw';
import {TestBed} from '@angular/core/testing';
import {provideHttpClient, withXhr} from '@angular/common/http';
import {HallsStore} from './halls.store';
import {APP_CONFIG} from '../../configs/app-config';
import {firstValueFrom} from 'rxjs';

// 1. Définition des mocks API avec MSW
const mockHalls = [
  { id: '1', name: 'Salle A', addressStreet: 'Rue 1', addressCity: 'Ville 1', addressPostalCode: '11111', addressCountry: 'Pays' },
  { id: '2', name: 'Salle B', addressStreet: 'Rue 2', addressCity: 'Ville 2', addressPostalCode: '22222', addressCountry: 'Pays' }
];

const server = setupServer(
  http.get('*/api/v1/halls', () => {
    return HttpResponse.json(mockHalls);
  }),
  http.post('*/api/v1/halls', async ({ request }) => {
    const newHall = await request.json() as any;
    return HttpResponse.json({ ...newHall, id: '3' }, { status: 201 });
  })
);

describe('HallsStore (Integration with MSW)', () => {
  let store: HallsStore;

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withXhr()),
        HallsStore,
        { provide: APP_CONFIG, useValue: { apiUrl: 'http://api.test' } }
      ]
    });
    store = TestBed.inject(HallsStore);
  });

  it('should load halls from API and update hallsSignal', async () => {
    // On attend que la ressource soit chargée (grâce à httpResource)
    // On utilise une boucle simple pour attendre que le signal soit rempli
    await new Promise(resolve => setTimeout(resolve, 100)); 

    expect(store.hallsSignal()).toHaveLength(2);
    expect(store.hallsSignal()[0].name).toBe('Salle A');
  });

  it('should implement Zero Reload Policy: update local cache after creation', async () => {
    // Attend le chargement initial
    await new Promise(resolve => setTimeout(resolve, 100));
    const initialCount = store.hallsSignal().length;

    const newHallData = { 
      name: 'Nouvelle Salle', 
      addressStreet: 'Rue X', 
      addressCity: 'Ville X', 
      addressPostalCode: '00000', 
      addressCountry: 'Pays' 
    };

    // On exécute la création
    await firstValueFrom(store.createHall(newHallData));

    // Vérification : le cache local doit avoir +1 sans avoir appelé reload() manuellement
    expect(store.hallsSignal()).toHaveLength(initialCount + 1);
    expect(store.hallsSignal().find(h => h.name === 'Nouvelle Salle')).toBeDefined();
  });
});
