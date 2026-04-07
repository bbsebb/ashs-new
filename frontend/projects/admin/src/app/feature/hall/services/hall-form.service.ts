import {computed, inject, Injectable, linkedSignal, signal, Signal} from '@angular/core';
import {FieldTree, form, maxLength, required, SchemaPathTree} from '@angular/forms/signals';
import {FormErrorHandleService, HallsStore} from '@shared-api'
import {NotificationService} from '@shared-ui';
import {Hall} from '@shared-domain';
import {Router} from '@angular/router';
import {MatDialogRef} from '@angular/material/dialog';
import {catchError, firstValueFrom, map, of, tap} from 'rxjs';

export type HallFormModel = Omit<Hall, 'id'>;

@Injectable()
export class HallFormService {
  private readonly _formErrorHandler = inject(FormErrorHandleService);
  private readonly _hallsStore = inject(HallsStore);
  private readonly _router = inject(Router);
  private readonly _notificationService = inject(NotificationService);
  private readonly _dialogReference = inject(MatDialogRef, {optional: true});

  private _hallId = signal<string | undefined>(undefined);
  
  readonly hallSignal: Signal<Hall | undefined> = this._hallsStore.hallById(this._hallId);
  readonly isLoadingSignal = this._hallsStore.isLoadingSignal;

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

  readonly hallPreview = computed(() => this.hallModelSignal() as Hall);
  readonly hallForm: FieldTree<HallFormModel>;

  constructor() {
    this.hallForm = this._buildForm();
  }

  init(id: string | undefined) {
    this._hallId.set(id);
  }

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

  private _handleHallSubmission = async (form: FieldTree<HallFormModel>) => {
    const currentId = this._hallId();
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

  private _handleSubmissionError(error: unknown, form: FieldTree<HallFormModel>) {
    const errorResult = this._formErrorHandler.handleError(error, form);
    if (typeof errorResult === 'string') {
      this._notificationService.show(errorResult, 'error');
      return undefined;
    }
    return errorResult;
  }

  private _buildForm(): FieldTree<HallFormModel> {
    return form(this.hallModelSignal, (path) => this._applyValidationSchema(path), {
      submission: {
        action: this._handleHallSubmission
      }
    });
  }
}
