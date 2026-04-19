import {Component, inject} from '@angular/core';
import {AuthService} from '../../core/services/auth-service';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import {LayoutService} from '@shared-api';

/**
 * Component representing the administration dashboard.
 * Displays navigation cards to various administrative features like Seasons, Halls, Teams, and Staff.
 * Handles authentication status to show protected content or login/register options.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  protected readonly authService = inject(AuthService);
  protected readonly layoutService = inject(LayoutService);

  /**
   * List of administrative features available on the dashboard.
   */
  protected readonly features = [
    { icon: 'military_tech', label: 'Saisons', description: 'Gérez les différentes saisons sportives.', path: '/seasons', color: 'primary' },
    { icon: 'stadium', label: 'Salles', description: 'Gérez les lieux d\'entrainement et de match.', path: '/halls', color: 'accent' },
    { icon: 'diversity_3', label: 'Équipes', description: 'Gérez vos effectifs et catégories.', path: '/teams', color: 'warn' },
    { icon: 'supervisor_account', label: 'Staff', description: 'Gérez les entraineurs et encadrants.', path: '/staffs', color: 'primary' },
  ];

  /**
   * Initiates the login process via AuthService.
   */
  protected login() {
    this.authService.login();
  }

  /**
   * Initiates the registration process via AuthService.
   */
  protected register() {
    this.authService.register();
  }
}
