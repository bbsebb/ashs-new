import {computed, inject, Injectable, linkedSignal, signal} from '@angular/core';
import {AgeGroupStore, CreateAgeGroupDTO, FormErrorHandleService} from '@shared-api';
import {Router} from '@angular/router';
import {NotificationService} from '@shared-ui';
import {form, schema} from '@angular/forms/signals';
import {catchError, firstValueFrom, map, of, tap} from 'rxjs';
import {MatDialogRef} from '@angular/material/dialog';

export interface AgeGroupModel {
  ageLimit: number;
  upperLimit: boolean;
}

@Injectable()
export class AgeGroupFormService {
  private readonly _formErrorHandler = inject(FormErrorHandleService);
  private readonly _ageGroupStore = inject(AgeGroupStore);
  private readonly _router = inject(Router);
  private readonly _notificationService = inject(NotificationService);
  private readonly _dialogReference = inject(MatDialogRef, {optional: true});

  readonly ageGroupModelSignal = linkedSignal<AgeGroupModel>(() => {
    return {
      ageLimit: 0,
      upperLimit: false,
    };
  });

  readonly ageGroupPreviewSignal = computed(() => this.preview(this.ageGroupModelSignal()));

  readonly ageGroupForm = form(this.ageGroupModelSignal, schema((_) => {
    return
  }), {
    submission: {
      action: (form) => {
        const ageGroupDTO: CreateAgeGroupDTO = {
          ...this.ageGroupModelSignal(),
        };
        return firstValueFrom(this._ageGroupStore.createAgeGroup(ageGroupDTO).pipe(
          tap((newAgeGroup) => {
            this._notificationService.show("La catégorie a été enregistrée", 'success');
            if (this._dialogReference) {
              this._dialogReference.close(newAgeGroup);
            } else {
              void this._router.navigateByUrl(`/teams`);
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

  private preview(ageGroupModel: AgeGroupModel): string {
    const sign = ageGroupModel.upperLimit ? "-" : "+";
    return `${sign}${ageGroupModel.ageLimit} ans`;
  }
}
