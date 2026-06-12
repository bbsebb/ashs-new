import {beforeAll, afterAll, afterEach, describe, expect, it, beforeEach} from 'vitest';
import {setupServer} from 'msw/node';
import {http, HttpResponse} from 'msw';
import {TestBed} from '@angular/core/testing';
import {provideHttpClient, withXhr} from '@angular/common/http';
import {SeasonsStore} from './seasons.store';
import {APP_CONFIG} from '../../configs/app-config';
import {firstValueFrom} from 'rxjs';

const mockSeasons = [
  { id: '1', name: '2024-2025', startDate: '2024-09-01', endDate: '2025-06-30', isCurrent: true, isActive: true },
  { id: '2', name: '2023-2024', startDate: '2023-09-01', endDate: '2024-06-30', isCurrent: false, isActive: false }
];

const server = setupServer(
  http.get('*/api/v1/seasons', () => {
    return HttpResponse.json(mockSeasons);
  }),
  http.post('*/api/v1/seasons', async ({ request }) => {
    const newSeason = await request.json() as any;
    return HttpResponse.json({ ...newSeason, id: '3', name: '2025-2026', isCurrent: false, isActive: false }, { status: 201 });
  })
);

describe('SeasonsStore', () => {
  let store: SeasonsStore;

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withXhr()),
        SeasonsStore,
        { provide: APP_CONFIG, useValue: { apiUrl: 'http://api.test' } }
      ]
    });
    store = TestBed.inject(SeasonsStore);
  });

  it('should load seasons and initialize seasonsSignal', async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(store.seasonsSignal()).toHaveLength(2);
    expect(store.seasonsSignal()[0].name).toBe('2024-2025');
  });

  it('should update local cache when a season is created (Zero Reload)', async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const initialCount = store.seasonsSignal().length;

    const newSeasonData = { startDate: '2025-09-01', endDate: '2026-06-30' };
    await firstValueFrom(store.createSeason(newSeasonData));

    expect(store.seasonsSignal()).toHaveLength(initialCount + 1);
    expect(store.seasonsSignal().some(s => s.name === '2025-2026')).toBe(true);
  });
});
