import { Component, input } from '@angular/core';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/**
 * Global loading overlay for data fetching operations.
 * Displays a centered spinner and an optional label.
 */
@Component({
  selector: 'app-loading-data',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  templateUrl: './loading-data.html',
  styleUrl: './loading-data.scss',
})
export class LoadingData {
  /** Visibility state. */
  isLoadingSignal = input<boolean>(true);
  /** Text message to display below the spinner. */
  labelSignal = input<string>('Téléchargement des données…');
}
