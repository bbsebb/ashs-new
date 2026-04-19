import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {AuthService} from '../services/auth-service';
import {environment} from '@environment';
import {catchError, throwError} from 'rxjs';
import {NotificationService} from '@shared-ui';
import {Router} from '@angular/router';

/**
 * Functional HTTP interceptor that manages authentication headers and handles authorization errors.
 *
 * This interceptor:
 * 1. Appends a Bearer token to outgoing requests directed to the API URL if the user is authenticated.
 * 2. Catches 401 (Unauthorized) errors to trigger a logout and notify the user.
 * 3. Catches 403 (Forbidden) errors to notify the user of insufficient permissions and redirect to home.
 *
 * @param req The outgoing HTTP request.
 * @param next The next interceptor or backend in the chain.
 * @returns An observable of the HTTP event stream.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const notificationService = inject(NotificationService);
  const router = inject(Router);
  
  const token = authService.getToken();
  const apiUrl = environment.apiUrl;

  let request = req;

  // On ne modifie la requête que si elle s'adresse à notre API
  if (token && req.url.startsWith(apiUrl)) {
    request = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        notificationService.show('Session expirée. Veuillez vous reconnecter.', 'error');
        authService.logout();
      } else if (error.status === 403) {
        notificationService.show('Vous n\'avez pas les droits nécessaires pour effectuer cette action.', 'error');
        void router.navigateByUrl('/');
      }
      return throwError(() => error);
    })
  );
};
