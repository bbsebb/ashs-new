import {Injectable, resource, signal} from '@angular/core';
import Keycloak from 'keycloak-js';
import {environment} from '@environment';

export interface UserProfile {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  profilePicture?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly keycloak = new Keycloak(environment.keycloakConfig);
  // Signal simple pour l'état d'authentification
  public isLoggedIn = signal(false);

  // 🚀 Utilisation de la nouvelle API resource !
  public userProfile = resource({
    params: () => this.isLoggedIn(),

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


  public async init(): Promise<void> {
    try {
      const authenticated = await this.keycloak.init({
        onLoad: 'check-sso', // Vérifie la session silencieusement
        pkceMethod: 'S256'
      });

      // Mettre à jour ce signal va automatiquement déclencher le loader de la `resource` ci-dessus !
      this.isLoggedIn.set(authenticated);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de Keycloak', error);
    }
  }

  public login(): void {
    void this.keycloak.login();
  }

  public register(): void {
    void this.keycloak.register();
  }

  public logout(): void {
    void this.keycloak.logout({redirectUri: window.location.origin});
  }

  public getToken(): string | undefined {
    return this.keycloak.token;
  }
}
