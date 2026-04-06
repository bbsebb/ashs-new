import {computed, inject, Injectable, linkedSignal, signal, Signal} from '@angular/core';
import {FieldTree, form, schema} from '@angular/forms/signals';
import {CreateSeasonDTO, dateToYyyyMmDd, FormErrorHandleService, SeasonsStore, UpdateSeasonDTO} from '@shared-api';
import {Season} from '@shared-domain';
import {NotificationService} from '@shared-ui';
import {Router} from '@angular/router';
import {MatDialogRef} from '@angular/material/dialog';
import {catchError, firstValueFrom, map, of, tap} from 'rxjs';

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
  readonly isLoading = this._seasonsStore.isLoadingSignal;

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

  readonly seasonForm = this.buildForm();

  readonly seasonPreview = computed(() => this.mapToSeason(this.seasonModelSignal()));

  init(id: string | undefined) {
    this._seasonId.set(id);
  }

  private buildForm(): FieldTree<SeasonFormModel> {
    return form(this.seasonModelSignal, schema((p) => {
      return
    }), {
      submission: {
        action: (form) => {
          const currentId = this._seasonId();
          const model = this.seasonModelSignal();
          const request$ = !currentId
            ? this._seasonsStore.createSeason(this.mapToCreateSeasonDTO(model))
            : this._seasonsStore.updateSeason(currentId, this.mapToCreateSeasonDTO(model));

          return firstValueFrom(request$.pipe(
            tap((createdOrUpdatedSeason) => {
              this._notificationService.show(`La saison a été ${!currentId ? 'enregistrée' : 'mise à jour'}`, 'success');
              if (this._dialogReference) {
                this._dialogReference.close(createdOrUpdatedSeason);
              } else {
                void this._router.navigateByUrl(`/seasons/${createdOrUpdatedSeason.id}`);
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
