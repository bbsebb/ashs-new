import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

/**
 * Pipe used to bypass Angular's built-in security for safe resource URLs.
 * Essential for embedding external content like Google Maps iframes.
 */
@Pipe({
  name: 'safe',
  standalone: true
})
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Declares a URL as safe for use as a resource.
   * @param url The URL string to trust.
   * @returns A SafeResourceUrl.
   */
  transform(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
