import {beforeAll, afterAll, afterEach, describe, expect, it, beforeEach} from 'vitest';
import {setupServer} from 'msw/node';
import {http, HttpResponse} from 'msw';
import {TestBed} from '@angular/core/testing';
import {provideHttpClient, withXhr} from '@angular/common/http';
import {MetaStore} from './meta-store';
import {APP_CONFIG} from '@shared-api';
import {GraphMetaDTO} from './models/meta.dtos';

const mockFeedsResponse: GraphMetaDTO = {
  data: [
    { id: 'f1', createdTime: '2024-04-01T12:00:00Z', message: 'Nouveau match !', attachments: { data: [] } },
    { id: 'f2', createdTime: '2024-04-02T12:00:00Z', message: 'Victoire !', attachments: { data: [] } }
  ]
};

const server = setupServer(
  http.get('*/api/v1/meta/feeds', () => {
    return HttpResponse.json(mockFeedsResponse);
  })
);

describe('MetaStore', () => {
  let store: MetaStore;

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withXhr()),
        MetaStore,
        { provide: APP_CONFIG, useValue: { apiUrl: 'http://api.test' } }
      ]
    });
    store = TestBed.inject(MetaStore);
  });

  it('should load feeds and initialize feedsSignal', async () => {
    // Attendre que la requête HTTP du constructeur aboutisse
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(store.feedsSignal()).toHaveLength(2);
    expect(store.feedsSignal()[0].message).toBe('Nouveau match !');
  });

  it('should allow reloading feeds', async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Change the mock response dynamically
    server.use(
      http.get('*/api/v1/meta/feeds', () => {
        return HttpResponse.json({ data: [] });
      })
    );

    // Call reload
    store.reloadFeeds();
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(store.feedsSignal()).toHaveLength(0);
  });
});
