import {InjectionToken, Signal} from '@angular/core';


export interface MenuItem {
  icon: string;
  label: string;
  path: string;
}

export const MENU_CONFIG = new InjectionToken<Signal<MenuItem[]>>('menu-config');
