import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth-service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { LayoutService } from '@shared-api';

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

  protected readonly features = [
    { icon: 'military_tech', label: 'Saisons', description: 'Gérez les différentes saisons sportives.', path: '/seasons', color: 'primary' },
    { icon: 'stadium', label: 'Salles', description: 'Gérez les lieux d\'entrainement et de match.', path: '/halls', color: 'accent' },
    { icon: 'diversity_3', label: 'Équipes', description: 'Gérez vos effectifs et catégories.', path: '/teams', color: 'warn' },
    { icon: 'supervisor_account', label: 'Staff', description: 'Gérez les entraineurs et encadrants.', path: '/staffs', color: 'primary' },
  ];

  protected login() {
    this.authService.login();
  }

  protected register() {
    this.authService.register();
  }
}
