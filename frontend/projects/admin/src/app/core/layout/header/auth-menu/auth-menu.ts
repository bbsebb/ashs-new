import {Component, inject} from '@angular/core';
import {AuthService} from '../../../services/auth-service';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatDividerModule} from '@angular/material/divider';
import {MatTooltipModule} from '@angular/material/tooltip';
import {LayoutService} from '@shared-api';

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
  protected readonly authService = inject(AuthService);
  protected readonly layoutService = inject(LayoutService);

  protected login() {
    this.authService.login();
  }

  protected logout() {
    this.authService.logout();
  }
}
