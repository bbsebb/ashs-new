import {inject, Injectable} from '@angular/core';
import {APP_CONFIG} from '../configs/app-config';

/**
 * Service for handling image URL generation and CSS background formatting.
 * Resolves local paths to full backend upload URLs and handles absolute URLs/blobs.
 */
@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private readonly config = inject(APP_CONFIG);

  /**
   * Resolves an image source into a valid URL for display.
   *
   * @param source The image identifier, absolute URL, blob, or data URL.
   * @returns A string containing the full URL or a default placeholder path.
   */
  createImageSourceUrl(source: string | null | undefined): string | null {
    if (source === null) {
      return null;
    }
    const DEFAULT_AVATAR_IMAGE_PATH = '/shared-ui/avatar.png';
    if (!source) {
      return DEFAULT_AVATAR_IMAGE_PATH;
    }

    // Check if the source is already a full URL or a browser-native format
    const isAbsoluteOrBrowserImageSource =
      source.startsWith('http://') ||
      source.startsWith('https://') ||
      source.startsWith('blob:') ||
      source.startsWith('data:');

    if (isAbsoluteOrBrowserImageSource) {
      return source;
    }

    // Otherwise, assume it is a filename stored in the backend uploads folder
    const uploadsBaseUrl = `${this.config.apiUrl}${this.config.uploadsPath}`;

    return `${uploadsBaseUrl}/${source}`;
  }

  /**
   * Wraps an image URL in the CSS url() function.
   *
   * @param imageSource The URL to wrap.
   * @returns A string compatible with the CSS background-image property.
   */
  buildCssBackgroundImageUrl(imageSource: string): string {
    return `url(${imageSource})`;
  }
}
