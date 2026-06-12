import {Component, ChangeDetectionStrategy} from '@angular/core';
import {MatToolbar} from "@angular/material/toolbar";
import {RouterLink} from '@angular/router';
import {NgOptimizedImage} from '@angular/common';

/**
 * Main application header component.
 * Features a centralized logo that overlaps the toolbar and slots for navigation menus.
 */
@Component({
  selector: 'app-header',
  imports: [
    MatToolbar,
    RouterLink,
    NgOptimizedImage
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true
})
export class Header {
}
