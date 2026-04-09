import {render, screen} from '@testing-library/angular';
import {describe, expect, it} from 'vitest';
import {Media} from './media';
import {MediaDTO} from '../../models/meta.dtos';
import {NgOptimizedImage} from '@angular/common';

describe('Media Component (Public)', () => {
  const mockImageMedia: MediaDTO = {
    image: { src: 'test-image.jpg', width: 800, height: 600 }
  };

  const mockVideoMedia: MediaDTO = {
    image: { src: 'video-poster.jpg', width: 800, height: 600 },
    source: 'test-video.mp4'
  };

  it('should render an image with priority attributes when type is photo and priority is true', async () => {
    await render(Media, {
      componentInputs: {
        media: mockImageMedia,
        type: 'photo',
        priority: true
      },
      imports: [NgOptimizedImage]
    });

    const img = screen.getByRole('img', { name: /instagram media/i });
    expect(img).toBeDefined();
    expect(img.getAttribute('fetchpriority')).toBe('high');
    expect(img.getAttribute('loading')).toBe('eager');
  });

  it('should render a video element when type is video', async () => {
    await render(Media, {
      componentInputs: {
        media: mockVideoMedia,
        type: 'video',
        priority: false
      }
    });

    // Le tag vidéo contient le texte directement, donc container EST la balise video
    const container = screen.getByText(/Votre navigateur ne supporte pas les vidéos HTML5/i);
    expect(container).toBeDefined();
    expect(container.getAttribute('poster')).toBe('video-poster.jpg');
  });

  it('should render error fallback image for unknown types', async () => {
    await render(Media, {
      componentInputs: {
        media: mockImageMedia,
        type: 'unknown_type',
        priority: false
      },
      imports: [NgOptimizedImage]
    });

    const errorImg = screen.getByAltText(/feed media error/i);
    expect(errorImg).toBeDefined();
  });
});
