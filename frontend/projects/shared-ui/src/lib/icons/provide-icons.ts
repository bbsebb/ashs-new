import {inject, provideAppInitializer} from '@angular/core';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';

interface SvgIconConfiguration {
  name: string;
  path: string;
}

/**
 * List of custom SVG icons used across the shared-ui library and applications.
 */
const SHARED_ICONS_CONFIGURATION: SvgIconConfiguration[] = [
  { name: 'instagram', path: 'shared-ui/icons/instagram.svg' },
];

/**
 * Configures the MatIconRegistry to include shared SVG icons during application startup.
 * @returns A set of providers for application initialization.
 */
export function provideSharedIcons() {
  return [
    provideAppInitializer(() => {
      const iconRegistry = inject(MatIconRegistry);
      const domSanitizer = inject(DomSanitizer);

      SHARED_ICONS_CONFIGURATION.forEach(icon => {
        iconRegistry.addSvgIcon(
          icon.name,
          domSanitizer.bypassSecurityTrustResourceUrl(icon.path)
        );
      });
    })
  ];
}
