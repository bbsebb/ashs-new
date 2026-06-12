import {afterAll, afterEach, beforeAll, beforeEach, describe, expect, it} from 'vitest';
import {setupServer} from 'msw/node';
import {http, HttpResponse} from 'msw';
import {TestBed} from '@angular/core/testing';
import {provideHttpClient, withXhr} from '@angular/common/http';
import {APP_CONFIG, CampaignStore} from '@shared-api';
import {firstValueFrom} from 'rxjs';

const mockCampaigns = [
  {id: '1', seasonId: 'season-1', status: 'DRAFT', categories: [{name: 'Cat1', amount: 10}]}
];

const server = setupServer(
  http.get('*/api/v1/campaigns', () => {
    return HttpResponse.json(mockCampaigns);
  }),
  http.get('*/api/public/campaigns/active', () => {
    return HttpResponse.json(mockCampaigns.find(c => c.status === 'LAUNCHED') || null);
  }),
  http.post('*/api/v1/campaigns', async ({request}) => {
    const dto = await request.json() as any;
    return HttpResponse.json({...dto, id: '2', status: 'DRAFT'}, {status: 201});
  })
);

describe('CampaignStore', () => {
  let store: CampaignStore;

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withXhr()),
        CampaignStore,
        {provide: APP_CONFIG, useValue: {apiUrl: 'http://api.test'}}
      ]
    });
    store = TestBed.inject(CampaignStore);
  });

  it('should load campaigns and initialize campaignsSignal', async () => {
    // Wait for resource to load
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(store.campaignsSignal()).toHaveLength(1);
    expect(store.campaignsSignal()[0].id).toBe('1');
  });

  it('should update local cache when a campaign is created', async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const initialCount = store.campaignsSignal().length;

    const newDto = {seasonId: 'season-2', categories: []};
    await firstValueFrom(store.createCampaign(newDto));

    expect(store.campaignsSignal()).toHaveLength(initialCount + 1);
    expect(store.campaignsSignal().some(c => c.id === '2')).toBe(true);
  });
});
