import {Component, inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';

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
  styleUrl: './confirmation-dialog.scss'
})
export class ConfirmationDialog {

  private readonly dialogRef = inject(MatDialogRef);
  readonly data = inject<ConfirmationDialogData>(MAT_DIALOG_DATA);
  cancel() {
      this.dialogRef.close();
  }
}

export type ConfirmationDialogData = {title:string,content:string}
