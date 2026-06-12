import {Component, inject, ViewEncapsulation, ChangeDetectionStrategy} from '@angular/core';
import {MAT_SNACK_BAR_DATA, MatSnackBarAction, MatSnackBarLabel, MatSnackBarRef} from '@angular/material/snack-bar';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';

/**
 * Custom snackbar component for displaying application notifications.
 * Uses Angular Material SnackBar internals for data injection and actions.
 */
@Component({
  selector: 'app-notification',
  imports: [
    MatSnackBarLabel,
    MatSnackBarAction,
    MatButton,
    MatIcon
  ],
  templateUrl: './notification.html',
  styleUrl: './notification.scss',
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'notification-container'
  },
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true

})
export class Notification {
  /** The notification message string injected via MAT_SNACK_BAR_DATA. */
  data:string = inject(MAT_SNACK_BAR_DATA);
  /** Reference to the current snackbar for dismissal. */
  snackBarRef = inject(MatSnackBarRef);
  constructor() { }
}
