import {Component, effect, inject, input} from '@angular/core';
import {FormField, FormRoot} from '@angular/forms/signals';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {FormFieldErrorDirective, FormSubmitButton, HallCard, PageTitle} from '@shared-ui';
import {Router} from '@angular/router';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {HallFormService} from '../../services/hall-form.service';

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
  protected readonly hallFormService = inject(HallFormService);
  private readonly _dialogReference = inject(MatDialogRef, {optional: true});
  private readonly _router = inject(Router);

  id = input<string | undefined>(undefined);

  constructor() {
    effect(() => {
      this.hallFormService.init(this.id());
    });
  }

  protected cancel(): void {
    if (this._dialogReference) {
      this._dialogReference.close();
    } else {
      void this._router.navigateByUrl(`/halls`);
    }
  }
}
