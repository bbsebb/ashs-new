import {ApplicationConfig, computed, ErrorHandler, inject, provideBrowserGlobalErrorListeners} from '@angular/core';
import {provideRouter, TitleStrategy, withComponentInputBinding, withInMemoryScrolling} from '@angular/router';
import {registerLocaleData} from '@angular/common';
import localFr from '@angular/common/locales/fr';
import {routes} from './app.routes';
import {MENU_CONFIG, provideSharedIcons} from '@shared-ui';
import {menuItems} from './core/layout/menu-items';
import {APP_CONFIG, CampaignStore, GlobalErrorHandler} from '@shared-api';
import {environment} from '@environment';
import {MyCustomPageTitleStrategy} from './shared/services/title-strategy';
import {provideAnimations} from '@angular/platform-browser/animations';


/*export const delayInterceptor: HttpInterceptorFn = (req, next) => {
  // On ajoute un délai de 2 secondes en développement
  return next(req).pipe(delay(200));
};*/
registerLocaleData(localFr);

export function menuConfigFactory() {
  const campaignStore = inject(CampaignStore);
  return computed(() => {
    const activeCampaign = campaignStore.activeCampaignSignal();
    if (!activeCampaign) {
      return menuItems.filter(item => item.icon !== 'card_membership');
    }
    return menuItems;
  });
}

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
    provideAnimations(),
    {
      provide: MENU_CONFIG,
      useFactory: menuConfigFactory
    }, {
      provide: APP_CONFIG,
      useValue: environment
    }
  ]
};

