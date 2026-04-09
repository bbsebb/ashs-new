import {render, screen} from '@testing-library/angular';
import {describe, expect, it, vi} from 'vitest';
import {FeedsList} from './feeds-list';
import {MetaStore} from '../../meta-store';
import {signal} from '@angular/core';
import userEvent from '@testing-library/user-event';
import {FeedDTO} from '../../models/meta.dtos';

describe('FeedsList Component (Public)', () => {
  const mockFeeds: FeedDTO[] = [
    { id: 'f1', createdTime: '2024-04-01T12:00:00Z', message: 'Nouveau match !', attachments: { data: [{ type: 'photo', mediaType: 'image', media: { image: { src: 'img.jpg', width: 10, height: 10 } } }] } }
  ];

  const setupMocks = (feedsData?: FeedDTO[] | null) => {
    return {
      metaStore: {
        feedsSignal: signal(feedsData || []),
        isLoadingSignal: signal(false),
        errorSignal: signal<Error | null>(null),
        reloadFeeds: vi.fn()
      }
    };
  };

  it('should render loading state when data is loading', async () => {
    const mocks = setupMocks([]);
    mocks.metaStore.isLoadingSignal.set(true);

    await render(FeedsList, {
      providers: [
        { provide: MetaStore, useValue: mocks.metaStore }
      ]
    });

    expect(screen.getByRole('status')).toBeDefined(); // LoadingData component
  });

  it('should render error state and allow retry', async () => {
    const mocks = setupMocks([]);
    mocks.metaStore.errorSignal.set(new Error('Network error'));

    const user = userEvent.setup();
    await render(FeedsList, {
      providers: [
        { provide: MetaStore, useValue: mocks.metaStore }
      ]
    });

    expect(screen.getByText(/Impossible de charger/i)).toBeDefined();
    
    const retryBtn = screen.getByRole('button', { name: /réessayer/i });
    await user.click(retryBtn);

    expect(mocks.metaStore.reloadFeeds).toHaveBeenCalled();
  });

  it('should render feeds grid when data is loaded', async () => {
    const mocks = setupMocks(mockFeeds);

    await render(FeedsList, {
      providers: [
        { provide: MetaStore, useValue: mocks.metaStore }
      ]
    });

    expect(screen.getByText('Nouveau match !')).toBeDefined();
  });

  it('should render empty state message if no feeds exist', async () => {
    const mocks = setupMocks([]);

    await render(FeedsList, {
      providers: [
        { provide: MetaStore, useValue: mocks.metaStore }
      ]
    });

    expect(screen.getByText(/Aucun média actuellement/i)).toBeDefined();
  });
});
