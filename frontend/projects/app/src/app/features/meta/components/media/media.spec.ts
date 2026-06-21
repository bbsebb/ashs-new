import {render, screen} from '@testing-library/angular';
import {describe, expect, it, vi} from 'vitest';
import {Media} from './media';
import {MediaDTO} from '../../models/meta.dtos';
import {NgOptimizedImage} from '@angular/common';
import {MatDialog} from '@angular/material/dialog';
import userEvent from '@testing-library/user-event';

describe('Media Component (Public)', () => {
  const mockImageMedia: MediaDTO = {
    image: { src: 'test-image.jpg', width: 800, height: 600 }
  };

  const mockVideoMedia: MediaDTO = {
    image: { src: 'video-poster.jpg', width: 800, height: 600 },
    source: 'test-video.mp4',
    embedHtml: '<iframe>test</iframe>'
  };

  const mockMatDialog = {
    open: vi.fn()
  };

  it('should render an image with priority attributes when type is photo and priority is true', async () => {
    await render(Media, {
      componentInputs: {
        media: mockImageMedia,
        type: 'photo',
        priority: true
      },
      imports: [NgOptimizedImage],
      providers: [
        {provide: MatDialog, useValue: mockMatDialog}
      ]
    });

    const img = screen.getByRole('img', { name: /instagram media/i });
    expect(img).toBeDefined();
    expect(img.getAttribute('fetchpriority')).toBe('high');
    expect(img.getAttribute('loading')).toBe('eager');
  });

  it('should render image and "Voir la vidéo" button when type is video and open dialog on click', async () => {
    const user = userEvent.setup();
    mockMatDialog.open.mockClear();

    await render(Media, {
      componentInputs: {
        media: mockVideoMedia,
        type: 'video',
        priority: false
      },
      imports: [NgOptimizedImage],
      providers: [
        {provide: MatDialog, useValue: mockMatDialog}
      ]
    });

    // Devrait afficher l'image de la vidéo (poster)
    const img = screen.getByRole('img', {name: /instagram media/i});
    expect(img).toBeDefined();
    expect(img.getAttribute('src')).toContain('video-poster.jpg');

    // Devrait afficher le bouton "Voir la vidéo"
    const playButton = screen.getByRole('button', {name: /Voir la vidéo/i});
    expect(playButton).toBeDefined();

    // Cliquer sur le bouton doit appeler MatDialog.open
    await user.click(playButton);
    expect(mockMatDialog.open).toHaveBeenCalled();
  });

  it('should open dialog with sourceUrl as fallback when embedHtml is missing', async () => {
    const user = userEvent.setup();
    mockMatDialog.open.mockClear();

    const videoMediaWithoutEmbed: MediaDTO = {
      image: {src: 'video-poster.jpg', width: 800, height: 600},
      source: 'test-video-fallback.mp4'
    };

    await render(Media, {
      componentInputs: {
        media: videoMediaWithoutEmbed,
        type: 'video',
        priority: false
      },
      imports: [NgOptimizedImage],
      providers: [
        {provide: MatDialog, useValue: mockMatDialog}
      ]
    });

    const playButton = screen.getByRole('button', {name: /Voir la vidéo/i});
    await user.click(playButton);

    expect(mockMatDialog.open).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        data: expect.objectContaining({
          sourceUrl: 'test-video-fallback.mp4'
        })
      })
    );
  });

  it('should open dialog with width 450px for portrait video format', async () => {
    const user = userEvent.setup();
    mockMatDialog.open.mockClear();

    const videoMediaPortrait: MediaDTO = {
      image: {src: 'video-poster.jpg', width: 800, height: 600},
      source: 'test-video-portrait.mp4',
      embedHtml: '<iframe>test</iframe>',
      videoWidth: 720,
      videoHeight: 1280
    };

    await render(Media, {
      componentInputs: {
        media: videoMediaPortrait,
        type: 'video',
        priority: false
      },
      imports: [NgOptimizedImage],
      providers: [
        {provide: MatDialog, useValue: mockMatDialog}
      ]
    });

    const playButton = screen.getByRole('button', {name: /Voir la vidéo/i});
    await user.click(playButton);

    expect(mockMatDialog.open).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        width: '450px'
      })
    );
  });

  it('should render error fallback image for unknown types', async () => {
    await render(Media, {
      componentInputs: {
        media: mockImageMedia,
        type: 'unknown_type',
        priority: false
      },
      imports: [NgOptimizedImage],
      providers: [
        {provide: MatDialog, useValue: mockMatDialog}
      ]
    });

    const errorImg = screen.getByAltText(/feed media error/i);
    expect(errorImg).toBeDefined();
  });
});

