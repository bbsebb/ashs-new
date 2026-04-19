import {Component, effect, inject, input} from '@angular/core';
import {FormField, FormRoot} from '@angular/forms/signals';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {FormFieldErrorDirective, FormSubmitButton, HallCard, PageTitle} from '@shared-ui';
import {Router} from '@angular/router';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {HallFormService} from '../../services/hall-form.service';

/**
 * Component for creating or editing a Hall.
 * It uses HallFormService to manage the form state and logic.
 * Can be displayed as a standalone page or within a dialog.
 */
@Component({
  selector: 'app-hall-form',
  providers: [HallFormService],
  imports: [
    FormField,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormSubmitButton,
    PageTitle,
    FormFieldErrorDirective,
    HallCard,
    MatDialogModule,
    FormRoot
  ],
  templateUrl: './hall-form.html',
  styleUrl: './hall-form.scss',
})
export class HallForm {
  /** Service for hall form management. */
  protected readonly _hallFormService = inject(HallFormService);
  /** Reference to the dialog if opened in a modal. */
  private readonly _dialogReference = inject(MatDialogRef, {optional: true});
  /** Router for navigation. */
  private readonly _router = inject(Router);

  /**
   * Optional hall ID provided via route parameters or input.
   * Bound from the 'id' route parameter.
   */
  idInputSignal = input<string | undefined>(undefined, {alias: 'id'});

  constructor() {
    /**
     * Effect to initialize the service when the ID input changes.
     */
    effect(() => {
      this._hallFormService.init(this.idInputSignal());
    });
  }

  /**
   * Cancels the form operation and navigates back or closes the dialog.
   */
  protected cancel(): void {
    if (this._dialogReference) {
      this._dialogReference.close();
    } else {
      void this._router.navigateByUrl(`/halls`);
    }
  }
}
