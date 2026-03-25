import {Component, inject} from '@angular/core';
import {MENU_CONFIG} from '../../menu-config';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {MatRipple} from '@angular/material/core';
import {MatIcon} from '@angular/material/icon';

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
  menuItems = inject(MENU_CONFIG);
}
