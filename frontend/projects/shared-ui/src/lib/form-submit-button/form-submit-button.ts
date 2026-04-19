import {Component, input} from '@angular/core';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatButton} from '@angular/material/button';

/**
 * Standardized submit button for forms.
 * Automatically handles loading state with a spinner and disabling logic.
 */
@Component({
  selector: 'app-form-submit-button',
  imports: [
    MatProgressSpinner,
    MatButton
  ],
  templateUrl: './form-submit-button.html',
  styleUrl: './form-submit-button.css',
})
export class FormSubmitButton {
  /** True when the form is being submitted (shows spinner). */
  submittingSignal = input<boolean>(false);

  /** Business-level disabling (e.g., form invalid, missing permissions). */
  disabledSignal = input<boolean>(false);

  /** The text content to display on the button. */
  contentSignal = input<string>('Envoyer');

  /**
   * Internal logic to determine if the button should be disabled.
   * @returns True if either disabled or submitting input is true.
   */
  protected isDisabled(): boolean {
    return this.disabledSignal() || this.submittingSignal();
  }
}
