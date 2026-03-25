import {Component, computed, inject, linkedSignal} from '@angular/core';
import {AgeGroupStore, CreateAgeGroupDTO, FormErrorHandleService} from '@shared-api';
import {Router, RouterLink} from '@angular/router';
import {FormFieldErrorDirective, FormSubmitButton, NotificationService, PageTitle} from '@shared-ui';
import {form, FormField, submit} from '@angular/forms/signals';
import {MatError, MatFormField, MatInput, MatLabel, MatSuffix} from '@angular/material/input';
import {MatOption, MatSelect} from '@angular/material/select';
import {MatButton} from '@angular/material/button';
import {firstValueFrom, tap} from 'rxjs';

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
    RouterLink,
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
        let resultId: string | undefined;
        const newAgeGroup = await firstValueFrom(this._ageGroupStore.createAgeGroup(ageGroupDTO).pipe(
          tap(() => this._notificationService.show("L'équipe a été enregistrée", 'success'))
        ));
        resultId = newAgeGroup.id;
        await this._router.navigateByUrl(`/teams`);
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

  private preview(ageGroupModel: AgeGroupModel): string {
    const sign = ageGroupModel.upperLimit ? "-" : "+";
    return `${sign}${ageGroupModel.ageLimit} ans`;
  }
}


interface AgeGroupModel {
  ageLimit: number;
  upperLimit: boolean;
}
