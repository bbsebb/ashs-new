import {render, screen} from '@testing-library/angular';
import {describe, expect, it} from 'vitest';
import {FeedDialog} from './feed-dialog';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {FeedDTO} from '../../models/meta.dtos';

describe('FeedDialog Component', () => {
  const mockFeed: FeedDTO = {
    id: '1',
    createdTime: '2024-04-01T12:00:00Z',
    message: 'Message dans la modale',
    attachments: {
      data: [{
        type: 'photo',
        mediaType: 'image',
        media: { image: { src: 'img.jpg', width: 10, height: 10 } }
      }]
    }
  };

  it('should render dialog content correctly', async () => {
    await render(FeedDialog, {
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: { feed: mockFeed }
        }
      ]
    });

    // Le contenu texte
    expect(screen.getByText('Message dans la modale')).toBeDefined();
    
    // Le Media component devrait être injecté car on passe 'photo' en type.
    // L'image d'erreur ou l'image réelle devrait s'afficher.
    expect(screen.getByRole('img')).toBeDefined();
  });
});
