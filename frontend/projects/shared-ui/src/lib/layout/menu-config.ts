import {InjectionToken} from '@angular/core';


export interface MenuItem {
  icon: string;
  label: string;
  path: string;
}

export const MENU_CONFIG = new InjectionToken<MenuItem[]>('menu-config');
