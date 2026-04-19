import {Injectable, resource, signal} from '@angular/core';
import Keycloak from 'keycloak-js';
import {environment} from '@environment';

/**
 * Interface representing the user profile information retrieved from Keycloak.
 */
export interface UserProfile {
  /** The unique username of the user. */
  username?: string;
  /** The email address of the user. */
  email?: string;
  /** The first name of the user. */
  firstName?: string;
  /** The last name of the user. */
  lastName?: string;
  /** The full name of the user, computed from first and last names. */
  fullName: string;
  /** URL to the user's profile picture. */
  profilePicture?: string;
}

/**
 * Service responsible for managing authentication using Keycloak.
 * It handles initialization, login, logout, and provides reactive access to the user's authentication state and profile.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  /** Keycloak instance initialized with configuration from environment. */
  private readonly keycloak = new Keycloak(environment.keycloakConfig);

  /**
   * Signal tracking whether the user is currently authenticated.
   * Updated during initialization.
   */
  public isAuthenticatedSignal = signal(false);

  /**
   * Resource managing the user's profile data.
   * It automatically reloads when `isAuthenticatedSignal` changes.
   * Uses Keycloak's `loadUserProfile` to fetch data.
   */
  public userProfile = resource({
    params: () => this.isAuthenticatedSignal(),

    loader: async ({params: loggedIn}): Promise<UserProfile | null> => {
      if (!loggedIn) return null;

      const profile = await this.keycloak.loadUserProfile();

      // Extraction de la photo de profil depuis le token ID (si disponible)
      const idTokenParsed = this.keycloak.idTokenParsed as any;
      const profilePicture = idTokenParsed?.picture || idTokenParsed?.avatar_url;

      const firstName = profile.firstName || '';
      const lastName = profile.lastName || '';
      const fullName = (firstName + ' ' + lastName).trim() || profile.username || 'Utilisateur';

      return {
        username: profile.username,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        fullName: fullName,
        profilePicture: profilePicture,
      };
    }
  });


  /**
   * Entry point to initialize the authentication service.
   * @returns A promise that resolves when Keycloak is initialized.
   */
  public initialize(): Promise<void> {
    return this.init();
  }

  /**
   * Private initialization logic for Keycloak.
   * Configures silent SSO check and updates `isAuthenticatedSignal`.
   */
  private async init(): Promise<void> {
    try {
      const authenticated = await this.keycloak.init({
        onLoad: 'check-sso', // Vérifie la session silencieusement
        pkceMethod: 'S256'
      });

      // Mettre à jour ce signal va automatiquement déclencher le loader de la `resource` ci-dessus !
      this.isAuthenticatedSignal.set(authenticated);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de Keycloak', error);
    }
  }

  /**
   * Redirects the user to the Keycloak login page.
   */
  public login(): void {
    void this.keycloak.login();
  }

  /**
   * Redirects the user to the Keycloak registration page.
   */
  public register(): void {
    void this.keycloak.register();
  }

  /**
   * Logs the user out from Keycloak and redirects back to the application origin.
   */
  public logout(): void {
    void this.keycloak.logout({redirectUri: window.location.origin});
  }

  /**
   * Retrieves the current access token from Keycloak.
   * @returns The access token string or undefined if not authenticated.
   */
  public getToken(): string | undefined {
    return this.keycloak.token;
  }
}
