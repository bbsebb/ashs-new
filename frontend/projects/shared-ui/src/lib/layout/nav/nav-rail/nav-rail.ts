import {Component, inject} from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {MatRipple} from '@angular/material/core';
import {MENU_CONFIG} from '../../menu-config';

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
  menuItems = inject(MENU_CONFIG);
}
