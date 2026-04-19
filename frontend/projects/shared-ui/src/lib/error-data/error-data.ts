import {Component, input, output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {ButtonBackHomeDirective} from '../button-back-home/button-back-home-directive';


/**
 * Component for displaying an error message when data fetching fails.
 * Provides a retry action and a button to return home.
 */
@Component({
  selector: 'app-error-data',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ButtonBackHomeDirective,
  ],
  templateUrl: './error-data.html',
  styleUrl: './error-data.scss',
})
export class ErrorData {
  /** The name of the data that failed to load (e.g., "teams"). */
  dataNameInputSignal = input<string>('', {alias: 'dataName'});

  /** Emitted when the user clicks the retry button. */
  onRetry = output<void>();
}
