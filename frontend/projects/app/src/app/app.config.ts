import {ApplicationConfig, provideBrowserGlobalErrorListeners} from '@angular/core';
import {provideRouter, TitleStrategy, withInMemoryScrolling} from '@angular/router';

import {routes} from './app.routes';
import {MENU_CONFIG, provideSharedIcons} from '@shared-ui';
import {menuItems} from './core/layout/menu-items';
import {APP_CONFIG} from '@shared-api';
import {environment} from '@environment';
import {MyCustomPageTitleStrategy} from './shared/services/title-strategy';


/*export const delayInterceptor: HttpInterceptorFn = (req, next) => {
  // On ajoute un délai de 2 secondes en développement
  return next(req).pipe(delay(200));
};*/
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // provideHttpClient(withInterceptors([delayInterceptor])),
    provideRouter(routes, withInMemoryScrolling({scrollPositionRestoration: 'top', anchorScrolling: 'enabled'})),
    {provide: TitleStrategy, useClass: MyCustomPageTitleStrategy},
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

