import {Component, computed, inject, input, linkedSignal, Signal} from '@angular/core';
import {FormFieldErrorDirective, FormSubmitButton, NotificationService, PageTitle} from "@shared-ui";
import {MatButton} from "@angular/material/button";
import {MatError, MatFormField, MatInputModule, MatLabel} from "@angular/material/input";
import {Router, RouterLink} from "@angular/router";
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

@Component({
  selector: 'app-season-form',
  imports: [
    FormSubmitButton,
    MatButton,
    MatError,
    MatFormField,
    MatLabel,
    PageTitle,
    RouterLink,
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
  private readonly formErrorHandler = inject(FormErrorHandleService);
  private readonly seasonsStore = inject(SeasonsStore);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  isLoading = this.seasonsStore.isLoadingSignal;
  error = computed(() => !!this.seasonsStore.errorSignal());
  id = input<string | undefined>(undefined);
  seasonSignal: Signal<Season | undefined> = this.seasonsStore.seasonById(this.id);
  isCreateForm = computed(() => !this.id());  // Or it's an "update" form if id is defined.

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
    const id = this.id();

    void submit(this.seasonForm, async (form) => {
      try {
        let resultId: string | undefined;
        if (!id) {
          const newSeason = await firstValueFrom(this.seasonsStore.createSeason(this.mapToCreateSeasonDTO(this.seasonModelSignal())).pipe(
            tap(() => this.notificationService.show('La saison a été enregistrée', 'success'))
          ));
          resultId = newSeason.id;
        } else {
          const updatedSeason = await firstValueFrom(this.seasonsStore.updateSeason(id, this.mapToCreateSeasonDTO(this.seasonModelSignal())).pipe(
            tap(() => this.notificationService.show('La saison a été mise à jour', 'success'))
          ));
          resultId = updatedSeason.id;
        }
        await this.router.navigateByUrl(`/seasons/${resultId}`);
        return undefined;
      } catch (error) {
        const result = this.formErrorHandler.handleError(error, form);
        if (typeof result === 'string') {
          this.notificationService.show(result, 'error');
          return undefined;
        }
        return result;
      }
    });
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

