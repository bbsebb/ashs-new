import { TestBed } from '@angular/core/testing';
import { ImageService } from './image.service';
import { APP_CONFIG } from '@shared-api';
import { describe, expect, it, beforeEach } from 'vitest';

describe('ImageService', () => {
  let service: ImageService;
  const config = { apiUrl: 'http://api', uploadsPath: '/up' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ImageService,
        { provide: APP_CONFIG, useValue: config }
      ]
    });
    service = TestBed.inject(ImageService);
  });

  it('should return default avatar if no source', () => {
    expect(service.createImageSourceUrl(null)).toBe('/shared-ui/avatar.png');
  });

  it('should return absolute URL if source is external', () => {
    expect(service.createImageSourceUrl('http://ext.com/img.jpg')).toBe('http://ext.com/img.jpg');
    expect(service.createImageSourceUrl('data:image/png;base64,...')).toContain('data:image/png');
  });

  it('should construct upload URL for local path', () => {
    expect(service.createImageSourceUrl('my-image.jpg')).toBe('http://api/up/my-image.jpg');
  });
});
