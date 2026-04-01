import {Component, computed, inject, input, linkedSignal, Signal} from '@angular/core';
import {FormFieldErrorDirective, FormSubmitButton, NotificationService, PageTitle} from "@shared-ui";
import {MatButton} from "@angular/material/button";
import {MatError, MatFormField, MatInputModule, MatLabel} from "@angular/material/input";
import {Router} from "@angular/router";
import {CreateSeasonDTO, dateToYyyyMmDd, UpdateSeasonDTO, FormErrorHandleService, SeasonsStore} from '@shared-api';
import {Season} from '@shared-domain';
import {FieldTree, form, FormField, submit} from '@angular/forms/signals';
import {firstValueFrom, tap} from 'rxjs';
import {SeasonCard} from '@shared-ui';
import {
  MatDatepickerModule,
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker
} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-season-form',
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

  ],
  templateUrl: './season-form.html',
  styleUrl: './season-form.scss',
})
export class SeasonForm {
  private readonly _formErrorHandler = inject(FormErrorHandleService);
  private readonly _seasonsStore = inject(SeasonsStore);
  private readonly _router = inject(Router);
  private readonly _notificationService = inject(NotificationService);
  private readonly _dialogReference = inject(MatDialogRef, {optional: true});

  isLoading = this._seasonsStore.isLoadingSignal;
  error = computed(() => !!this._seasonsStore.errorSignal());
  id = input<string | undefined>(undefined);
  seasonSignal: Signal<Season | undefined> = this._seasonsStore.seasonById(this.id);
  isCreateForm = computed(() => !this.id());

  // Form model reset automatically when seasonSignal changes
  seasonModelSignal = linkedSignal<SeasonFormModel>(() => {
    const season = this.seasonSignal();
    if (season) {
      return {
        endDate: new Date(season.endDate),
        startDate: new Date(season.startDate)
      };
    }
    const now = new Date();
    return {
      startDate: now,
      endDate: now,
    };
  });

  seasonForm = this.buildForm();
  seasonPreview = computed(() => this.mapToSeason(this.seasonModelSignal()));

  private buildForm(): FieldTree<SeasonFormModel> {
    return form(this.seasonModelSignal);
  }

  protected submitForm(event: Event) {
    event.preventDefault();
    const currentId = this.id();

    void submit(this.seasonForm, async (form) => {
      try {
        let resultId: string | undefined;
        let createdOrUpdatedSeason: Season | undefined;

        if (!currentId) {
          createdOrUpdatedSeason = await firstValueFrom(this._seasonsStore.createSeason(this.mapToCreateSeasonDTO(this.seasonModelSignal())).pipe(
            tap(() => this._notificationService.show('La saison a été enregistrée', 'success'))
          ));
          resultId = createdOrUpdatedSeason.id;
        } else {
          createdOrUpdatedSeason = await firstValueFrom(this._seasonsStore.updateSeason(currentId, this.mapToCreateSeasonDTO(this.seasonModelSignal())).pipe(
            tap(() => this._notificationService.show('La saison a été mise à jour', 'success'))
          ));
          resultId = createdOrUpdatedSeason.id;
        }

        if (this._dialogReference) {
          this._dialogReference.close(createdOrUpdatedSeason);
        } else {
          await this._router.navigateByUrl(`/seasons/${resultId}`);
        }
        return undefined;
      } catch (error) {
        const result = this._formErrorHandler.handleError(error, form);
        if (typeof result === 'string') {
          this._notificationService.show(result, 'error');
          return undefined;
        }
        return result;
      }
    });
  }

  protected cancel(): void {
    if (this._dialogReference) {
      this._dialogReference.close();
    } else {
      void this._router.navigateByUrl(`/seasons`);
    }
  }

  private mapToSeason(seasonFormModel: SeasonFormModel): Season {
    const StartDate = new Date(seasonFormModel.startDate);
    const EndDate = new Date(seasonFormModel.endDate);
    return {
      id: '',
      ...seasonFormModel,
      startDate: StartDate,
      endDate: EndDate,
      name: `${StartDate.getFullYear()}-${EndDate.getFullYear()}`,
      isCurrent: StartDate < new Date() && EndDate > new Date(),
      isActive: false
    }
  }

  private mapToCreateSeasonDTO<T extends CreateSeasonDTO | UpdateSeasonDTO>(seasonForm: SeasonFormModel): T {

    return {
      endDate: dateToYyyyMmDd(seasonForm.endDate),
      startDate: dateToYyyyMmDd(seasonForm.startDate),
    } as T
  }
}

interface SeasonFormModel {
  endDate: Date;
  startDate: Date;
}
