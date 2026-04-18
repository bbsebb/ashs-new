import {render, screen} from '@testing-library/angular';
import {describe, expect, it, vi} from 'vitest';
import {Dashboard} from './dashboard';
import {AuthService} from '../../core/services/auth-service';
import {provideRouter} from '@angular/router';
import {signal} from '@angular/core';

describe('Dashboard Component', () => {
  it('should render welcome message and features grid when logged in', async () => {
    // Mock du AuthService pour un utilisateur connecté
    const mockAuthService = {
      isAuthenticatedSignal: signal(true),
      userProfile: {
        value: () => ({ firstName: 'Alice' })
      },
      login: vi.fn(),
      register: vi.fn()
    };

    await render(Dashboard, {
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService }
      ]
    });

    // Vérifie le message de bienvenue personnalisé
    expect(screen.getByText(/Bienvenue, Alice !/i)).toBeDefined();
    
    // Vérifie qu'une des cartes de fonctionnalité est bien là
    expect(screen.getByText('Saisons')).toBeDefined();
    expect(screen.getByText('Salles')).toBeDefined();
    
    // Vérifie que le bloc d'accès protégé n'est pas là
    expect(screen.queryByText('Accès Protégé')).toBeNull();
  });

  it('should render protected access warning when not logged in', async () => {
    // Mock du AuthService pour un visiteur anonyme
    const mockAuthService = {
      isAuthenticatedSignal: signal(false),
      userProfile: {
        value: () => null
      },
      login: vi.fn(),
      register: vi.fn()
    };

    await render(Dashboard, {
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService }
      ]
    });

    // Vérifie que le bloc protégé est affiché
    expect(screen.getByText('Accès Protégé')).toBeDefined();
    expect(screen.getByText(/Administration réservée/i)).toBeDefined();
    
    // Vérifie que les boutons de connexion sont présents
    expect(screen.getByRole('button', { name: /connexion/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /s'inscrire/i })).toBeDefined();
    
    // Vérifie que la grille des fonctionnalités est cachée
    expect(screen.queryByText('Saisons')).toBeNull();
  });
});
