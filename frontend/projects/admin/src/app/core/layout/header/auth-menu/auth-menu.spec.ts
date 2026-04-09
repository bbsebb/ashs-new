import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthMenu } from './auth-menu';
import { AuthService } from '../../../services/auth-service';
import { LayoutService } from '@shared-api';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { signal } from '@angular/core';

describe('AuthMenu', () => {
  let component: AuthMenu;
  let fixture: ComponentFixture<AuthMenu>;
  const authServiceMock = { 
    login: vi.fn(), 
    logout: vi.fn(), 
    isAuthenticatedSignal: signal(false), 
    userProfile: { value: vi.fn() } 
  };
  const layoutMock = { isDesktopSignal: signal(true) };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthMenu],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: LayoutService, useValue: layoutMock },
        provideAnimationsAsync('noop')
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should call login', () => {
    (component as any).login();
    expect(authServiceMock.login).toHaveBeenCalled();
  });
});
