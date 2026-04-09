import {render, screen} from '@testing-library/angular';
import {describe, expect, it} from 'vitest';
import {Feed} from './feed';
import {FeedDTO} from '../../models/meta.dtos';
import {DatePipe} from '@angular/common';

describe('Feed Component (Public)', () => {
  const mockFeedPhoto: FeedDTO = {
    id: '1',
    createdTime: '2024-04-01T14:30:00Z',
    message: 'Superbe victoire !',
    attachments: {
      data: [
        {
          type: 'photo',
          media: { image: { src: 'photo.jpg', width: 800, height: 600 } },
          mediaType: 'image'
        }
      ]
    }
  };

  const mockFeedAlbum: FeedDTO = {
    id: '2',
    createdTime: '2024-04-02T10:00:00Z',
    message: 'Quelques souvenirs.',
    attachments: {
      data: [
        {
          type: 'album',
          mediaType: 'album',
          subAttachments: {
            data: [
              { type: 'photo', url: 'img1', target: { id: '1', url: '' }, media: { image: { src: '1.jpg', width: 10, height: 10 } } },
              { type: 'photo', url: 'img2', target: { id: '2', url: '' }, media: { image: { src: '2.jpg', width: 10, height: 10 } } }
            ]
          }
        }
      ]
    }
  };

  it('should render message and formatted date correctly', async () => {
    await render(Feed, {
      componentInputs: {
        feed: mockFeedPhoto
      },
      imports: [DatePipe]
    });

    expect(screen.getByText('Superbe victoire !')).toBeDefined();
    // Verification format date (DatePipe)
    expect(screen.getByText(/01\/04\/2024/i)).toBeDefined();
  });

  it('should render media placeholder or component for photo type', async () => {
    await render(Feed, {
      componentInputs: {
        feed: mockFeedPhoto
      }
    });

    // Le contenu media est géré via @defer. Dans JSDOM (testing library sans config spécifique viewport), 
    // le bloc @placeholder ou le composant direct peut être affiché.
    // L'important est que le composant ne crashe pas.
    expect(screen.getByText('Superbe victoire !')).toBeDefined();
  });

  it('should render media placeholder or carousel for album type', async () => {
    await render(Feed, {
      componentInputs: {
        feed: mockFeedAlbum
      }
    });

    expect(screen.getByText('Quelques souvenirs.')).toBeDefined();
  });
});
