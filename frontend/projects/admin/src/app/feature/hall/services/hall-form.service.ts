import {computed, inject, Injectable, linkedSignal, signal, Signal} from '@angular/core';
import {FieldTree, form, maxLength, required} from '@angular/forms/signals';
import {FormErrorHandleService, HallsStore} from '@shared-api'
import {NotificationService} from '@shared-ui';
import {Hall} from '@shared-domain';
import {Router} from '@angular/router';
import {MatDialogRef} from '@angular/material/dialog';
import {catchError, firstValueFrom, map, of, tap} from 'rxjs';

export type HallFormeModel = Omit<Hall, 'id'>;

@Injectable()
export class HallFormService {
  private readonly _formErrorHandler = inject(FormErrorHandleService);
  private readonly _hallsStore = inject(HallsStore);
  private readonly _router = inject(Router);
  private readonly _notificationService = inject(NotificationService);
  private readonly _dialogReference = inject(MatDialogRef, {optional: true});

  private _hallId = signal<string | undefined>(undefined);
  
  readonly hallSignal: Signal<Hall | undefined> = this._hallsStore.hallById(this._hallId);
  readonly isLoading = this._hallsStore.isLoadingSignal;

  readonly hallModelSignal = linkedSignal<HallFormeModel>(() => {
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
  readonly hallForm = this.buildForm();

  init(id: string | undefined) {
    this._hallId.set(id);
  }

  private buildForm(): FieldTree<HallFormeModel> {
    return form(this.hallModelSignal, (path) => {
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
    }, {
      submission: {
        action: (form) => {
          const currentId = this._hallId();
          const model = this.hallModelSignal();
          const request$ = !currentId
            ? this._hallsStore.createHall(model)
            : this._hallsStore.updateHall(currentId, model);

          return firstValueFrom(request$.pipe(
            tap((result) => {
              this._notificationService.show(`La salle a été ${!currentId ? 'enregistrée' : 'mise à jour'}`, 'success');
              if (this._dialogReference) {
                this._dialogReference.close(result);
              } else {
                void this._router.navigateByUrl(`/halls/${result.id}`);
              }
            }),
            map(() => undefined),
            catchError(error => {
              const result = this._formErrorHandler.handleError(error, form);
              if (typeof result === 'string') {
                this._notificationService.show(result, 'error');
                return of(undefined);
              }
              return of(result);
            })
          ));
        }
      }
    });
  }
}
