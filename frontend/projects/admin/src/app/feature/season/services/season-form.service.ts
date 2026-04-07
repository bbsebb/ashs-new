import {computed, inject, Injectable, linkedSignal, signal, Signal} from '@angular/core';
import {FieldTree, form, schema, SchemaPathTree} from '@angular/forms/signals';
import {CreateSeasonDTO, dateToYyyyMmDd, FormErrorHandleService, SeasonsStore, UpdateSeasonDTO} from '@shared-api';
import {Season} from '@shared-domain';
import {NotificationService} from '@shared-ui';
import {Router} from '@angular/router';
import {MatDialogRef} from '@angular/material/dialog';
import {firstValueFrom} from 'rxjs';

export interface SeasonFormModel {
  endDate: Date;
  startDate: Date;
}

@Injectable()
export class SeasonFormService {
  private readonly _formErrorHandler = inject(FormErrorHandleService);
  private readonly _seasonsStore = inject(SeasonsStore);
  private readonly _router = inject(Router);
  private readonly _notificationService = inject(NotificationService);
  private readonly _dialogReference = inject(MatDialogRef, {optional: true});

  private _seasonId = signal<string | undefined>(undefined);
  
  readonly seasonSignal: Signal<Season | undefined> = this._seasonsStore.seasonById(this._seasonId);
  readonly isLoadingSignal = this._seasonsStore.isLoadingSignal;

  readonly seasonModelSignal = linkedSignal<SeasonFormModel>(() => {
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

  readonly seasonForm: FieldTree<SeasonFormModel>;
  readonly seasonPreview = computed(() => this._mapToSeason(this.seasonModelSignal()));

  constructor() {
    this.seasonForm = this._buildForm();
  }

  init(id: string | undefined) {
    this._seasonId.set(id);
  }

  private _applyValidationSchema(path: SchemaPathTree<SeasonFormModel>) {
    // Schema logic if needed
  }

  private _handleSeasonSubmission = async (form: FieldTree<SeasonFormModel>) => {
    const currentIdentifier = this._seasonId();
    const model = this.seasonModelSignal();
    const seasonData = this._mapToCreateSeasonDTO(model);
    
    const request$ = !currentIdentifier
      ? this._seasonsStore.createSeason(seasonData)
      : this._seasonsStore.updateSeason(currentIdentifier, seasonData);

    try {
      const result = await firstValueFrom(request$);
      this._notificationService.show(`La saison a été ${!currentIdentifier ? 'enregistrée' : 'mise à jour'}`, 'success');
      
      if (this._dialogReference) {
        this._dialogReference.close(result);
      } else {
        void this._router.navigateByUrl(`/seasons/${result.id}`);
      }
      return undefined;
    } catch (error) {
      return this._handleSubmissionError(error, form);
    }
  };

  private _handleSubmissionError(error: unknown, form: FieldTree<SeasonFormModel>) {
    const errorResult = this._formErrorHandler.handleError(error, form);
    if (typeof errorResult === 'string') {
      this._notificationService.show(errorResult, 'error');
      return undefined;
    }
    return errorResult;
  }

  private _buildForm(): FieldTree<SeasonFormModel> {
    return form(this.seasonModelSignal, schema((path) => this._applyValidationSchema(path)), {
      submission: {
        action: this._handleSeasonSubmission
      }
    });
  }

  private _mapToSeason(seasonFormModel: SeasonFormModel): Season {
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

  private _mapToCreateSeasonDTO<T extends CreateSeasonDTO | UpdateSeasonDTO>(seasonForm: SeasonFormModel): T {
    return {
      endDate: dateToYyyyMmDd(seasonForm.endDate),
      startDate: dateToYyyyMmDd(seasonForm.startDate),
    } as T
  }
}
