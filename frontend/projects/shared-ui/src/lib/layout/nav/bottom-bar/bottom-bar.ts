import {Component, inject} from '@angular/core';
import {MENU_CONFIG} from '../../menu-config';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {MatRipple} from '@angular/material/core';
import {MatIcon} from '@angular/material/icon';

/**
 * Bottom navigation bar component for mobile devices.
 * Centered and floating bar rendering menu items.
 */
@Component({
  selector: '[app-bottom-bar]',
  imports: [
    RouterLink,
    RouterLinkActive,
    MatRipple,
    MatIcon
  ],
  templateUrl: './bottom-bar.html',
  styleUrl: './bottom-bar.scss',
  standalone: true
})
export class BottomBar {
  /** Menu configuration items injected from the root provider as a Signal. */
  readonly menuItems = inject(MENU_CONFIG);
}
