import {Component, input} from '@angular/core';

import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

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
  /** Text message to display below the spinner. */
  labelInputSignal = input<string>('Téléchargement des données…', {alias: 'label'});
}
