import {ApplicationConfig, ErrorHandler, provideBrowserGlobalErrorListeners} from '@angular/core';
import {provideRouter, TitleStrategy, withComponentInputBinding, withInMemoryScrolling} from '@angular/router';

import {routes} from './app.routes';
import {MENU_CONFIG, provideSharedIcons} from '@shared-ui';
import {menuItems} from './core/layout/menu-items';
import {APP_CONFIG, GlobalErrorHandler} from '@shared-api';
import {environment} from '@environment';
import {MyCustomPageTitleStrategy} from './shared/services/title-strategy';


/*export const delayInterceptor: HttpInterceptorFn = (req, next) => {
  // On ajoute un délai de 2 secondes en développement
  return next(req).pipe(delay(200));
};*/
export const appConfig: ApplicationConfig = {
  providers: [
    {provide: ErrorHandler, useClass: GlobalErrorHandler},
    provideBrowserGlobalErrorListeners(),
    // provideHttpClient(withInterceptors([delayInterceptor])),
    provideRouter(routes, withInMemoryScrolling({
      scrollPositionRestoration: 'top',
      anchorScrolling: 'enabled'
    }), withComponentInputBinding()),
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

