import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import {provideRouter, withComponentInputBinding} from '@angular/router';

import { routes } from './app.routes';
import {provideSharedIcons, MENU_CONFIG} from '@shared-ui';
import {menuItems} from './core/layout/menu-items';

import {environment} from '@environment';
import {APP_CONFIG} from '@shared-api';
/*export const delayInterceptor: HttpInterceptorFn = (req, next) => {
  // On ajoute un délai de 2 secondes en développement
  return next(req).pipe(delay(200));
};*/
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // provideHttpClient(withInterceptors([delayInterceptor])),
    provideRouter(routes,withComponentInputBinding()),
    provideSharedIcons(),
    {
      provide: MENU_CONFIG,
      useValue: menuItems
    }, {
     provide: APP_CONFIG,
      useValue: environment
    }
  ]
};
