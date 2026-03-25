import {inject, Injectable} from '@angular/core';
import {APP_CONFIG} from '@shared-api';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private readonly config = inject(APP_CONFIG);

  createImageSourceUrl(source: string | null | undefined): string {
    const DEFAULT_AVATAR_IMAGE_PATH = '/shared-ui/avatar.png';
    if (!source) {
      return DEFAULT_AVATAR_IMAGE_PATH;
    }
    const isAbsoluteOrBrowserImageSource =
      source.startsWith('http://') ||
      source.startsWith('https://') ||
      source.startsWith('blob:') ||
      source.startsWith('data:');
    if (isAbsoluteOrBrowserImageSource) {
      return source;
    }

    const uploadsBaseUrl = `${this.config.apiUrl}${this.config.uploadsPath}`;

    return `${uploadsBaseUrl}/${source}`;
  }

  buildCssBackgroundImageUrl(imageSource: string): string {
    return `url(${imageSource})`;
  }
}
