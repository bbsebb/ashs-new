import { TestBed } from '@angular/core/testing';
import { authGuard } from './auth-guard';
import { AuthService } from '../services/auth-service';
import { Router, UrlTree } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { signal } from '@angular/core';

describe('authGuard', () => {
  const setup = (isAuthenticated: boolean) => {
    const authServiceMock = { isAuthenticatedSignal: signal(isAuthenticated) };
    const routerMock = { parseUrl: vi.fn().mockReturnValue({} as UrlTree) };
    
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    });
    return { authServiceMock, routerMock };
  };

  it('should return true if authenticated', () => {
    setup(true);
    expect(TestBed.runInInjectionContext(() => authGuard())).toBe(true);
  });

  it('should return UrlTree if not authenticated', () => {
    const { routerMock } = setup(false);
    const result = TestBed.runInInjectionContext(() => authGuard());
    expect(result).toBe(routerMock.parseUrl(''));
  });
});
