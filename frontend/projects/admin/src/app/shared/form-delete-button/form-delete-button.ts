import {Component, inject, input, output} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {DialogService} from '@shared-ui';
import {take} from 'rxjs';

/**
 * Reusable delete button with a built-in confirmation dialog.
 * Styled with Material Design tokens for the error state.
 * Supports both full button with text and icon-only mode.
 */
@Component({
  selector: 'app-form-delete-button',
  imports: [
    MatButtonModule,
    MatIconModule
  ],
  template: `
    @if (iconOnlySignal()) {
      <button mat-icon-button
              type="button"
              class="delete-icon-btn"
              (click)="handleDelete($event)"
              [disabled]="disabledSignal()"
              [attr.aria-label]="confirmMessageSignal()">
        <mat-icon>delete</mat-icon>
      </button>
    } @else {
      <button mat-flat-button
              type="button"
              class="delete-btn"
              (click)="handleDelete($event)"
              [disabled]="disabledSignal()">
        <mat-icon>delete</mat-icon>
        Supprimer
      </button>
    }
  `,
  styles: `
    .delete-btn {
      background-color: var(--mat-sys-error);
      color: var(--mat-sys-on-error);
    }

    .delete-icon-btn {
      color: var(--mat-sys-error);
    }
  `
})
export class FormDeleteButton {
  private readonly _dialogService = inject(DialogService);

  /** Confirmation message to display in the dialog. */
  confirmMessageSignal = input<string>('Êtes-vous sûr de vouloir supprimer cet élément ?', {alias: 'confirmMessage'});

  /** Whether the button is disabled. */
  disabledSignal = input<boolean>(false, {alias: 'disabled'});

  /** Whether to show only the icon. */
  iconOnlySignal = input<boolean>(false, {alias: 'iconOnly'});

  /** Emitted only if the user confirms the deletion. */
  deleteConfirmed = output<void>();

  protected handleDelete(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    this._dialogService.showConfirmation(this.confirmMessageSignal())
      .pipe(take(1))
      .subscribe(confirmed => {
        if (confirmed) {
          this.deleteConfirmed.emit();
        }
      });
  }
}
