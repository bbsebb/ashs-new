import {Component, inject} from '@angular/core';
import {AuthService} from '../../../services/auth-service';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatDividerModule} from '@angular/material/divider';
import {MatTooltipModule} from '@angular/material/tooltip';
import {LayoutService} from '@shared-api';

/**
 * Component responsible for displaying the user authentication menu in the header.
 * It provides buttons for logging in and logging out, and displays the user's profile if authenticated.
 */
@Component({
  selector: 'app-auth-menu',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './auth-menu.html',
  styleUrl: './auth-menu.scss',
})
export class AuthMenu {
  /** Injected authentication service to handle login/logout and access user profile. */
  protected readonly authService = inject(AuthService);
  /** Injected layout service to handle responsive design states. */
  protected readonly layoutService = inject(LayoutService);

  /**
   * Triggers the Keycloak login process via AuthService.
   */
  protected login() {
    this.authService.login();
  }

  /**
   * Triggers the Keycloak logout process via AuthService.
   */
  protected logout() {
    this.authService.logout();
  }
}
