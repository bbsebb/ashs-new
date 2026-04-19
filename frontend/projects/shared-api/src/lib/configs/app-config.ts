import {InjectionToken} from '@angular/core';

/**
 * Global application configuration interface.
 */
export interface AppConfig {
  /** Base URL for the backend API. */
  apiUrl: string;
  /** Base path for uploaded files. */
  uploadsPath: string;
}

/**
 * Injection token for the application configuration.
 */
export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');
