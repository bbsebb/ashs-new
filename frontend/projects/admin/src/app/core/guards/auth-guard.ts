import {inject} from '@angular/core';
import {AuthService} from '../services/auth-service';
import {Router} from '@angular/router';


/**
 * Functional route guard that protects administrative routes.
 * It checks the authentication state via `AuthService`.
 *
 * @returns `true` if the user is authenticated, otherwise a `UrlTree` redirecting to the root.
 */
export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router)
  return authService.isAuthenticatedSignal() ? true : router.parseUrl('');
};
