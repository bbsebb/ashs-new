import { TestBed } from '@angular/core/testing';
import { authInterceptor } from './auth-interceptor';
import { AuthService } from '../services/auth-service';
import { NotificationService } from '@shared-ui';
import { Router } from '@angular/router';
import { HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { environment } from '@environment';

describe('authInterceptor', () => {
  const authServiceMock = { getToken: vi.fn(), logout: vi.fn() };
  const notificationMock = { show: vi.fn() };
  const routerMock = { navigateByUrl: vi.fn() };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: NotificationService, useValue: notificationMock },
        { provide: Router, useValue: routerMock }
      ]
    });
  });

  it('should add Authorization header for API requests', () => {
    authServiceMock.getToken.mockReturnValue('my-token');
    const req = new HttpRequest('GET', environment.apiUrl + '/data');
    const next: HttpHandlerFn = (r) => {
      expect(r.headers.get('Authorization')).toBe('Bearer my-token');
      return of();
    };
    TestBed.runInInjectionContext(() => authInterceptor(req, next)).subscribe();
  });

  it('should handle 401 error', () => {
    const req = new HttpRequest('GET', '/test');
    const errorResponse = new HttpErrorResponse({ status: 401 });
    const next: HttpHandlerFn = () => throwError(() => errorResponse);

    TestBed.runInInjectionContext(() => authInterceptor(req, next)).subscribe({
      error: () => {
        expect(notificationMock.show).toHaveBeenCalled();
        expect(authServiceMock.logout).toHaveBeenCalled();
      }
    });
  });
});
