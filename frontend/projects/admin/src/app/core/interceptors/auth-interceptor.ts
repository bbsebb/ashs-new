import {HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {AuthService} from '../services/auth-service';
import {environment} from '@environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  const apiUrl = environment.apiUrl;

  // On ne modifie la requête que si elle s'adresse à notre API
  if (token && req.url.startsWith(apiUrl)) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  // Sinon, on laisse passer la requête telle quelle
  return next(req);
};
