import {Component, inject, ChangeDetectionStrategy} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';

/**
 * Standard confirmation modal using Angular Material Dialog.
 * Used for dangerous actions like deletions.
 */
@Component({
  selector: 'app-confirmation-dialog',
  imports: [
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    MatButton,
    MatDialogClose
  ],
  templateUrl: './confirmation-dialog.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './confirmation-dialog.scss'
})
export class ConfirmationDialog {

  private readonly dialogRef = inject(MatDialogRef);

  /** Data injected from the DialogService (title and content). */
  readonly data = inject<ConfirmationDialogData>(MAT_DIALOG_DATA);

  /** Closes the dialog without confirming. */
  cancel() {
      this.dialogRef.close();
  }
}

/** Configuration data for the confirmation dialog. */
export type ConfirmationDialogData = {
  /** The title of the modal. */
  title: string;
  /** The main message/question for the user. */
  content: string;
}
