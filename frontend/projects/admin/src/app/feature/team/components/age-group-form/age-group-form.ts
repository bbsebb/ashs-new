import {Component, computed, inject, linkedSignal} from '@angular/core';
import {AgeGroupStore, CreateAgeGroupDTO, FormErrorHandleService} from '@shared-api';
import {Router} from '@angular/router';
import {FormFieldErrorDirective, FormSubmitButton, NotificationService, PageTitle} from '@shared-ui';
import {form, FormField, submit} from '@angular/forms/signals';
import {MatError, MatFormField, MatInput, MatLabel, MatSuffix} from '@angular/material/input';
import {MatOption, MatSelect} from '@angular/material/select';
import {MatButton} from '@angular/material/button';
import {firstValueFrom, tap} from 'rxjs';
import {MatDialogRef} from '@angular/material/dialog';
import {AgeGroup} from '@shared-domain';

@Component({
  selector: 'app-age-group-form',
  imports: [
    PageTitle,
    MatFormField,
    MatSelect,
    MatLabel,
    MatOption,
    MatError,
    FormField,
    FormFieldErrorDirective,
    MatInput,
    FormSubmitButton,
    MatButton,
    MatSuffix
  ],
  templateUrl: './age-group-form.html',
  styleUrl: './age-group-form.scss',
})
export class AgeGroupForm {
  private readonly _formErrorHandler = inject(FormErrorHandleService);
  private readonly _ageGroupStore = inject(AgeGroupStore);
  private readonly _router = inject(Router);
  private readonly _notificationService = inject(NotificationService);
  private readonly _dialogReference = inject(MatDialogRef, {optional: true});

  ageGroupModelSignal = linkedSignal<AgeGroupModel>(() => {
    return {
      ageLimit: 0,
      upperLimit: false,
    };
  });
  ageGroupPreviewSignal = computed(() => this.preview(this.ageGroupModelSignal()))
  ageGroupForm = form(this.ageGroupModelSignal)

  protected submitForm(event: Event) {
    event.preventDefault();
    void submit(this.ageGroupForm, async (form) => {
      try {
        const ageGroupDTO: CreateAgeGroupDTO = {
          ...this.ageGroupModelSignal(),
        };
        const newAgeGroup = await firstValueFrom(this._ageGroupStore.createAgeGroup(ageGroupDTO).pipe(
          tap(() => this._notificationService.show("La catégorie a été enregistrée", 'success'))
        ));

        if (this._dialogReference) {
          this._dialogReference.close(newAgeGroup);
        } else {
          await this._router.navigateByUrl(`/teams`);
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
      void this._router.navigateByUrl(`/teams`);
    }
  }

  private preview(ageGroupModel: AgeGroupModel): string {
    const sign = ageGroupModel.upperLimit ? "-" : "+";
    return `${sign}${ageGroupModel.ageLimit} ans`;
  }
}


interface AgeGroupModel {
  ageLimit: number;
  upperLimit: boolean;
}
