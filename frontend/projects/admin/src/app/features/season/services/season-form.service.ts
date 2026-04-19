import {computed, inject, Injectable, linkedSignal, signal, Signal} from '@angular/core';
import {FieldTree, form, schema, SchemaPathTree} from '@angular/forms/signals';
import {CreateSeasonDTO, dateToYyyyMmDd, FormErrorHandleService, SeasonsStore, UpdateSeasonDTO} from '@shared-api';
import {Season} from '@shared-domain';
import {NotificationService} from '@shared-ui';
import {Router} from '@angular/router';
import {MatDialogRef} from '@angular/material/dialog';
import {firstValueFrom} from 'rxjs';
import {SeasonFormModel} from './season.dtos';

/**
 * Service managing the state and logic for the season form.
 * Handles creation, updates, and validation of sport seasons.
 */
@Injectable()
export class SeasonFormService {
  private readonly _formErrorHandler = inject(FormErrorHandleService);
  private readonly _seasonsStore = inject(SeasonsStore);
  private readonly _router = inject(Router);
  private readonly _notificationService = inject(NotificationService);
  private readonly _dialogReference = inject(MatDialogRef, {optional: true});

  /** Internal signal tracking the ID of the season being edited. */
  private _seasonIdSignal = signal<string | undefined>(undefined);

  /** Signal providing the season data from the store based on the current ID. */
  readonly seasonSignal: Signal<Season | undefined> = this._seasonsStore.seasonById(this._seasonIdSignal);
  /** Signal indicating if data is currently being fetched from the store. */
  readonly isLoadingSignal = this._seasonsStore.isLoadingSignal;

  /**
   * Linked signal that synchronizes the form model with the loaded season data.
   * Resets to current date for new seasons.
   */
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

  /** The Signal-based form tree derived from the model. */
  readonly seasonFormSignal: FieldTree<SeasonFormModel>;
  /** Computed signal determining if the submit button should be disabled. */
  readonly isSubmitDisabledSignal = computed(() => this.seasonFormSignal().submitting() || this.seasonFormSignal().invalid());
  /** Computed signal for a live preview of the season being edited. */
  readonly seasonPreviewSignal = computed(() => this._mapToSeason(this.seasonModelSignal()));

  constructor() {
    this.seasonFormSignal = this._buildForm();
  }

  /**
   * Initializes the service with a season ID.
   * @param id The UUID of the season to edit, or undefined for creation.
   */
  init(id: string | undefined) {
    this._seasonIdSignal.set(id);
  }

  /**
   * Defines validation rules for the season form fields.
   */
  private _applyValidationSchema(path: SchemaPathTree<SeasonFormModel>) {
    // Schema logic if needed
  }

  /**
   * Handles the submission logic for the season form.
   * Performs either a create or update request based on the presence of an ID.
   */
  private _handleSeasonSubmission = async (form: FieldTree<SeasonFormModel>) => {
    const currentIdentifier = this._seasonIdSignal();
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

  /**
   * Maps backend/network errors to the form tree using the central error handler.
   */
  private _handleSubmissionError(error: unknown, form: FieldTree<SeasonFormModel>) {
    const errorResult = this._formErrorHandler.handleError(error, form);
    if (typeof errorResult === 'string') {
      this._notificationService.show(errorResult, 'error');
      return undefined;
    }
    return errorResult;
  }

  /**
   * Builds the Signal-based form configuration.
   */
  private _buildForm(): FieldTree<SeasonFormModel> {
    return form(this.seasonModelSignal, schema((path) => this._applyValidationSchema(path)), {
      submission: {
        action: this._handleSeasonSubmission
      }
    });
  }

  /**
   * Internal mapper to create a Season domain object from the form model for previewing.
   */
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

  /**
   * Maps the UI form model to the backend DTO format (dates as strings).
   */
  private _mapToCreateSeasonDTO<T extends CreateSeasonDTO | UpdateSeasonDTO>(seasonForm: SeasonFormModel): T {
    return {
      endDate: dateToYyyyMmDd(seasonForm.endDate),
      startDate: dateToYyyyMmDd(seasonForm.startDate),
    } as T
  }
}
