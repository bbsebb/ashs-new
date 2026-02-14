import {Component, computed, effect, inject, input, signal, Signal, WritableSignal} from '@angular/core';
import {FormFieldErrorDirective, FormSubmitButton, NotificationService, PageTitle} from "@shared-ui";
import {MatButton} from "@angular/material/button";
import {MatError, MatFormField, MatInputModule, MatLabel} from "@angular/material/input";
import {Router, RouterLink} from "@angular/router";
import {
  CreateSeasonDTO,
  dateToDdMmYyyy,
  dateToYyyyMmDd,
  EditSeasonDTO,
  FormErrorHandleService,
  SeasonsStore
} from '@shared-api';
import {Season} from '@shared-domain';
import {FieldTree, form, FormField, submit} from '@angular/forms/signals';
import {firstValueFrom, tap} from 'rxjs';
import {SeasonCard} from '../season-card/season-card';
import {
  MatDatepickerModule,
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker
} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import {JsonPipe} from '@angular/common';

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
    JsonPipe,
  ],
  templateUrl: './season-form.html',
  styleUrl: './season-form.scss',
})
export class SeasonForm {
  private readonly formErrorHandler = inject(FormErrorHandleService);
  private readonly seasonsStore = inject(SeasonsStore);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  isLoading = this.seasonsStore.isLoading;
  error = computed(() => !!this.seasonsStore.error);
  id = input<string | undefined>(undefined);
  seasonSignal: Signal<Season | undefined> = this.seasonsStore.seasonById(this.id);
  isCreateForm = computed(() => !this.id());  // Or it's a "edit" form if id is defined.
  seasonModel = this.buildModel();
  seasonForm = this.buildForm();
  seasonPreview = computed(() =>  this.mapToSeason(this.seasonModel()));


  constructor() {
    effect(() => {
      const season = this.seasonSignal();
      if (season) {
        this.seasonModel.set(this.mapToSeasonFormModel(season))
      }
    });
  }

  private buildModel(): WritableSignal<SeasonFormModel> {
    const now = new Date();
    return signal<SeasonFormModel>({
      startDate: now,
      endDate: now,
    })
  }

  private buildForm(): FieldTree<SeasonFormModel> {
    return form(this.seasonModel);
  }

  protected submitForm(event: Event) {
    event.preventDefault();
    const id = this.id();

    void submit(this.seasonForm, async (form) => {
      try {
        if (!id) {
          await firstValueFrom(this.seasonsStore.createSeason(this.mapToCreateSeasonDTO(this.seasonModel())).pipe(
            tap(() => this.notificationService.show('La saison a été enregistrée','success'))
          ));
        } else {
          await firstValueFrom(this.seasonsStore.editSeason(id, this.mapToCreateSeasonDTO(this.seasonModel())).pipe(
            tap(() => this.notificationService.show('La saison a été mise à jour','success'))
          ));
        }
        await this.router.navigateByUrl('/seasons');
        return undefined;
      } catch (error) {
        return this.formErrorHandler.handleError(error, form);
      }
    });
  }

  private mapToSeasonFormModel(season:Season): SeasonFormModel {
    return {
      endDate: new Date(season.endDate),
      startDate: new Date(season.startDate)
    }
  }

  private mapToSeason(seasonFormModel:SeasonFormModel): Season {
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

  private mapToCreateSeasonDTO<T extends CreateSeasonDTO | EditSeasonDTO>(seasonForm: SeasonFormModel): T {

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
