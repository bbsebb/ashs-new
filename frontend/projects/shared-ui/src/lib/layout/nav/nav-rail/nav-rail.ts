import {Component, inject} from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {MatRipple} from '@angular/material/core';
import {MENU_CONFIG} from '../../menu-config';

/**
 * Side navigation rail component for desktop devices.
 * Dynamically renders menu items from the MENU_CONFIG.
 */
@Component({
  selector: '[app-nav-rail]',
  imports: [
    RouterLink,
    RouterLinkActive,
    MatIcon,
    MatRipple
  ],
  templateUrl: './nav-rail.html',
  styleUrl: './nav-rail.scss',
  standalone: true
})
export class NavRail {
  /** Menu configuration items injected from the root provider as a Signal. */
  readonly menuItems = inject(MENU_CONFIG);
}
