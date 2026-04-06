import {Component, inject} from '@angular/core';
import {FormFieldErrorDirective, FormSubmitButton, NotificationService, PageTitle} from '@shared-ui';
import {Router} from '@angular/router';
import {FormField, FormRoot} from '@angular/forms/signals';
import {MatError, MatFormField, MatInput, MatLabel, MatSuffix} from '@angular/material/input';
import {MatOption, MatSelect} from '@angular/material/select';
import {MatButton} from '@angular/material/button';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {AgeGroupFormService} from '../../services/age-group-form.service';

@Component({
  selector: 'app-age-group-form',
  providers: [AgeGroupFormService],
  imports: [
    PageTitle,
    MatFormField,
    MatSelect,
    MatLabel,
    MatOption,
    MatError,
    FormField,
    FormFieldErrorDirective,
    MatInput,
    FormSubmitButton,
    MatButton,
    MatSuffix,
    MatDialogModule,
    FormRoot
  ],
  templateUrl: './age-group-form.html',
  styleUrl: './age-group-form.scss',
})
export class AgeGroupForm {
  protected readonly ageGroupFormService = inject(AgeGroupFormService);
  private readonly _dialogReference = inject(MatDialogRef, {optional: true});
  private readonly _router = inject(Router);

  protected cancel(): void {
    if (this._dialogReference) {
      this._dialogReference.close();
    } else {
      void this._router.navigateByUrl(`/teams`);
    }
  }
}
