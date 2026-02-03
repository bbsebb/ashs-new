// projects/shared-ui/icons/src/provide-icons.ts
import { provideAppInitializer, inject } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * Fournit les icônes SVG de la bibliothèque shared-ui.
 */
export function provideSharedIcons() {
  return [
    provideAppInitializer(() => {
      // On utilise inject() directement dans la fonction
      const registry = inject(MatIconRegistry);
      const sanitizer = inject(DomSanitizer);

      const icons = [
        { name: 'instagram', path: 'shared-ui/icons/instagram.svg' },
      ];

      icons.forEach(icon => {
        registry.addSvgIcon(
          icon.name,
          sanitizer.bypassSecurityTrustResourceUrl(icon.path)
        )
      });
    })
  ];
}
