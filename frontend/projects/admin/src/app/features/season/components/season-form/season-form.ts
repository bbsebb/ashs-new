/**
 * Component for creating or editing a sport season via a form.
 */
import {Component, computed, effect, inject, input, ChangeDetectionStrategy} from '@angular/core';
import {FormFieldErrorDirective, FormSubmitButton, PageTitle, SeasonCard} from "@shared-ui";
import {MatButton} from "@angular/material/button";
import {MatError, MatFormField, MatInputModule, MatLabel} from "@angular/material/input";
import {FormField, FormRoot} from '@angular/forms/signals';
import {
  MatDatepickerModule,
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker
} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {SeasonFormService} from '../../services/season-form.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-season-form',
  providers: [SeasonFormService],
  imports: [
    FormSubmitButton,
    MatButton,
    MatError,
    MatFormField,
    MatLabel,
    PageTitle,
    SeasonCard,
    FormFieldErrorDirective,
    FormField,
    MatInputModule,
    MatDatepickerToggle,
    MatDateRangeInput,
    MatDateRangePicker,
    MatFormFieldModule,
    MatDatepickerModule,
    FormsModule,
    MatDialogModule,
    FormRoot
  ],
  templateUrl: './season-form.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './season-form.scss',
})
export class SeasonForm {
  protected readonly seasonFormService = inject(SeasonFormService);
  private readonly _dialogReference = inject(MatDialogRef, {optional: true});
  private readonly _router = inject(Router);

  idInputSignal = input<string | undefined>(undefined, {alias: 'id'});

  seasonCardViewModelSignal = computed(() => {
    const season = this.seasonFormService.seasonPreviewSignal();
    return {
      id: season.id,
      name: season.name,
      startDate: season.startDate,
      endDate: season.endDate,
      isActive: season.isActive,
      isCurrent: season.isCurrent
    };
  });

  constructor() {
    effect(() => {
      this.seasonFormService.init(this.idInputSignal());
    });
  }

  protected cancel(): void {
    if (this._dialogReference) {
      this._dialogReference.close();
    } else {
      void this._router.navigateByUrl(`/seasons`);
    }
  }
}
