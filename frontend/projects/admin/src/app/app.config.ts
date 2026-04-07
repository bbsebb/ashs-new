import {
  ApplicationConfig,
  inject,
  LOCALE_ID,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners
} from '@angular/core';
import {provideRouter, withComponentInputBinding} from '@angular/router';
import localFr from '@angular/common/locales/fr';
import {routes} from './app.routes';
import {MENU_CONFIG, provideSharedIcons} from '@shared-ui';
import {menuItems} from './core/layout/menu-items';

import {environment} from '@environment';
import {APP_CONFIG} from '@shared-api';
import {MAT_DATE_LOCALE, provideNativeDateAdapter} from '@angular/material/core';
import {registerLocaleData} from '@angular/common';
import {AuthService} from './core/services/auth-service';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {authInterceptor} from './core/interceptors/auth-interceptor';

/*export const delayInterceptor: HttpInterceptorFn = (req, next) => {
  // On ajoute un délai de 2 secondes en développement
  return next(req).pipe(delay(200));
};*/


registerLocaleData(localFr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // provideHttpClient(withInterceptors([delayInterceptor])),
    provideRouter(routes, withComponentInputBinding()),
    provideSharedIcons(),
    provideNativeDateAdapter(),
    provideHttpClient(
      withInterceptors([authInterceptor]) // <-- C'est ici que la magie opère
    ),
    provideAppInitializer(() => {
      // Bloque l'affichage tant que Keycloak n'a pas fini de s'initialiser
      return inject(AuthService).initialize();
    }),
    // Définit la locale pour Angular Material
    {provide: MAT_DATE_LOCALE, useValue: 'fr-FR'},

    // Définit la locale pour les pipes Angular (ex: {{ date | date }})
    {provide: LOCALE_ID, useValue: 'fr-FR'},
    {
      provide: MENU_CONFIG,
      useValue: menuItems
    }, {
      provide: APP_CONFIG,
      useValue: environment
    }
  ]
};
