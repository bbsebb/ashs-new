import {Component, input} from '@angular/core';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatButton} from '@angular/material/button';

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
  /**
   * True quand le formulaire est en cours d'envoi.
   */
  submitting = input<boolean>(false);

  /**
   * Désactivation “métier” (ex: form invalid, droits, etc.)
   */
  disabled = input<boolean>(false);

  content = input<string>('Envoyer');


  protected isDisabled(): boolean {
    return this.disabled() || this.submitting();
  }
}
