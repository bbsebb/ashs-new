import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth-service';
import Keycloak from 'keycloak-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Keycloak globalement
vi.mock('keycloak-js', () => {
  const mockInstance = {
    init: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    loadUserProfile: vi.fn(),
    idTokenParsed: {
      picture: 'http://test-picture'
    },
    token: 'test-token'
  };
  return {
    default: vi.fn(function () {
      return mockInstance;
    })
  };
});

describe('AuthService', () => {
  let service: AuthService;
  let keycloakMock: any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    // On récupère l'instance mockée créée par le constructeur
    keycloakMock = (service as any).keycloak;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize keycloak and update isAuthenticatedSignal to true', async () => {
    keycloakMock.init.mockResolvedValue(true);
    await service.initialize();
    expect(keycloakMock.init).toHaveBeenCalledWith({
      onLoad: 'check-sso',
      pkceMethod: 'S256'
    });
    expect(service.isAuthenticatedSignal()).toBe(true);
  });

  it('should initialize keycloak and update isAuthenticatedSignal to false', async () => {
    keycloakMock.init.mockResolvedValue(false);
    await service.initialize();
    expect(service.isAuthenticatedSignal()).toBe(false);
  });

  it('should handle initialization error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    keycloakMock.init.mockRejectedValue(new Error('Init failed'));
    await service.initialize();
    expect(service.isAuthenticatedSignal()).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith('Erreur lors de l\'initialisation de Keycloak', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('should call keycloak login', () => {
    service.login();
    expect(keycloakMock.login).toHaveBeenCalled();
  });

  it('should call keycloak logout with origin as redirectUri', () => {
    service.logout();
    expect(keycloakMock.logout).toHaveBeenCalledWith({ redirectUri: window.location.origin });
  });

  it('should call keycloak register', () => {
    service.register();
    expect(keycloakMock.register).toHaveBeenCalled();
  });

  it('should return token', () => {
    expect(service.getToken()).toBe('test-token');
  });

  it('should load user profile correctly via resource when authenticated', async () => {
    keycloakMock.loadUserProfile.mockResolvedValue({
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User'
    });
    
    let profile: any;
    import('@angular/core').then(({ effect }) => {
      TestBed.runInInjectionContext(() => {
        effect(() => { profile = service.userProfile.value(); });
      });
    });

    service.isAuthenticatedSignal.set(true);
    TestBed.flushEffects();
    
    await new Promise(resolve => setTimeout(resolve, 50));
    TestBed.flushEffects();

    expect(profile).toEqual({
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      fullName: 'Test User',
      profilePicture: 'http://test-picture'
    });
  });

  it('should return null profile when not authenticated', async () => {
    let profile: any;
    import('@angular/core').then(({ effect }) => {
      TestBed.runInInjectionContext(() => {
        effect(() => { profile = service.userProfile.value(); });
      });
    });
    service.isAuthenticatedSignal.set(false);
    
    TestBed.flushEffects();
    await new Promise(resolve => setTimeout(resolve, 50));
    TestBed.flushEffects();

    expect(profile).toBeNull();
  });

  it('should handle missing first/last names and use username as fallback for fullName', async () => {
    keycloakMock.loadUserProfile.mockResolvedValue({
      username: 'testuser',
      email: 'test@example.com'
    });
    keycloakMock.idTokenParsed = {}; // No picture

    let profile: any;
    import('@angular/core').then(({ effect }) => {
      TestBed.runInInjectionContext(() => {
        effect(() => { profile = service.userProfile.value(); });
      });
    });

    service.isAuthenticatedSignal.set(true);
    TestBed.flushEffects();

    await new Promise(resolve => setTimeout(resolve, 50));
    TestBed.flushEffects();

    expect(profile?.fullName).toBe('testuser');
    expect(profile?.profilePicture).toBeUndefined();
  });
});
