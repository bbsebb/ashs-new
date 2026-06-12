import {Component, input, ChangeDetectionStrategy} from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './form-submit-button.css',
})
export class FormSubmitButton {
  /** True when the form is being submitted (shows spinner). */
  submittingInputSignal = input<boolean>(false, {alias: 'submitting'});

  /** Business-level disabling (e.g., form invalid, missing permissions). */
  disabledInputSignal = input<boolean>(false, {alias: 'disabled'});

  /** The text content to display on the button. */
  contentInputSignal = input<string>('Envoyer', {alias: 'content'});

  /**
   * Internal logic to determine if the button should be disabled.
   * @returns True if either disabled or submitting input is true.
   */
  protected isDisabled(): boolean {
    return this.disabledInputSignal() || this.submittingInputSignal();
  }
}
