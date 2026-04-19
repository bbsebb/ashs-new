import {computed, inject, Injectable, linkedSignal, signal, Signal} from '@angular/core';
import {FieldTree, form, maxLength, required, SchemaPathTree} from '@angular/forms/signals';
import {FormErrorHandleService, HallsStore} from '@shared-api'
import {NotificationService} from '@shared-ui';
import {Hall} from '@shared-domain';
import {Router} from '@angular/router';
import {MatDialogRef} from '@angular/material/dialog';
import {firstValueFrom} from 'rxjs';
import {HallFormModel} from './hall.dtos';

/**
 * Service responsible for managing the Hall creation and edition form.
 * It uses Angular Signals for state management and the new signal-based form API.
 */
@Injectable()
export class HallFormService {
  private readonly _formErrorHandler = inject(FormErrorHandleService);
  private readonly _hallsStore = inject(HallsStore);
  private readonly _router = inject(Router);
  private readonly _notificationService = inject(NotificationService);
  private readonly _dialogReference = inject(MatDialogRef, {optional: true});

  /**
   * Internal signal to track the current hall ID being edited.
   */
  private _hallIdSignal = signal<string | undefined>(undefined);

  /**
   * Signal containing the hall data fetched from the store based on the current ID.
   */
  readonly hallSignal: Signal<Hall | undefined> = this._hallsStore.hallById(this._hallIdSignal);

  /**
   * Signal indicating if a loading operation is in progress.
   */
  readonly isLoadingSignal = this._hallsStore.isLoadingSignal;

  /**
   * linkedSignal used to synchronize the form model with the fetched hall data.
   * When the hallSignal changes, the form model is automatically reset with new values.
   */
  readonly hallModelSignal = linkedSignal<HallFormModel>(() => {
    const hall = this.hallSignal();
    return {
      name: hall?.name ?? '',
      addressStreet: hall?.addressStreet ?? '',
      addressCity: hall?.addressCity ?? '',
      addressPostalCode: hall?.addressPostalCode ?? '',
      addressCountry: hall?.addressCountry ?? ''
    };
  });

  /**
   * Computed signal providing a preview of the hall based on current form values.
   */
  readonly hallPreviewSignal = computed(() => this.hallModelSignal() as Hall);

  /**
   * Computed signal determining if the form submission should be disabled.
   */
  readonly isSubmitDisabledSignal = computed(() => this.hallForm().submitting() || this.hallForm().invalid());

  /**
   * The signal-based form tree representing the hall form.
   */
  readonly hallForm: FieldTree<HallFormModel>;

  constructor() {
    this.hallForm = this._buildForm();
  }

  /**
   * Initializes the service with an optional hall ID.
   * @param id The ID of the hall to edit, or undefined for creation.
   */
  init(id: string | undefined) {
    this._hallIdSignal.set(id);
  }

  /**
   * Defines the validation schema for the hall form.
   * Uses required and maxLength validators for all fields.
   * @param path The SchemaPathTree to apply validations on.
   */
  private _applyValidationSchema(path: SchemaPathTree<HallFormModel>) {
    required(path.name, {message: 'Le nom de la salle est requis.'});
    maxLength(path.name, 50, {message: 'Le nom de la salle ne doit pas dépasser 50 caractères.'});

    required(path.addressStreet, {message: 'La rue est requise.'});
    maxLength(path.addressStreet, 50, {message: 'La rue ne doit pas dépasser 50 caractères.'});

    required(path.addressCity, {message: 'La ville est requise.'});
    maxLength(path.addressCity, 50, {message: 'La ville ne doit pas dépasser 50 caractères.'});

    required(path.addressPostalCode, {message: 'Le code postal est requis.'});
    maxLength(path.addressPostalCode, 20, {message: 'Le code postal ne doit pas dépasser 20 caractères.'});

    required(path.addressCountry, {message: 'Le pays est requis.'});
    maxLength(path.addressCountry, 50, {message: 'Le pays ne doit pas dépasser 50 caractères.'});
  }

  /**
   * Asynchronous handler for form submission.
   * Dispatches create or update action to the store and handles navigation/notification.
   * @param form The form tree instance.
   */
  private _handleHallSubmission = async (form: FieldTree<HallFormModel>) => {
    const currentId = this._hallIdSignal();
    const model = this.hallModelSignal();
    const request$ = !currentId
      ? this._hallsStore.createHall(model)
      : this._hallsStore.updateHall(currentId, model);

    try {
      const result = await firstValueFrom(request$);
      this._notificationService.show(`La salle a été ${!currentId ? 'enregistrée' : 'mise à jour'}`, 'success');

      if (this._dialogReference) {
        this._dialogReference.close(result);
      } else {
        void this._router.navigateByUrl(`/halls/${result.id}`);
      }
      return undefined;
    } catch (error) {
      return this._handleSubmissionError(error, form);
    }
  };

  /**
   * Handles submission errors by delegating to FormErrorHandleService.
   * Shows a notification if the error is a general message.
   * @param error The error object.
   * @param form The form tree instance.
   * @returns The processed error for the form state.
   */
  private _handleSubmissionError(error: unknown, form: FieldTree<HallFormModel>) {
    const errorResult = this._formErrorHandler.handleError(error, form);
    if (typeof errorResult === 'string') {
      this._notificationService.show(errorResult, 'error');
      return undefined;
    }
    return errorResult;
  }

  /**
   * Builds the signal-based form using the 'form' factory.
   * Connects the form to the model signal and submission handler.
   * @returns A FieldTree instance representing the form.
   */
  private _buildForm(): FieldTree<HallFormModel> {
    return form(this.hallModelSignal, (path) => this._applyValidationSchema(path), {
      submission: {
        action: this._handleHallSubmission
      }
    });
  }
}
