import {Component, inject, linkedSignal} from '@angular/core';
import {AgeGroupStore} from '@shared-api';
import {Router, RouterLink} from '@angular/router';
import {FormFieldErrorDirective, FormSubmitButton, NotificationService, PageTitle} from '@shared-ui';
import {form, FormField} from '@angular/forms/signals';
import {MatError, MatFormField, MatInput, MatLabel, MatSuffix} from '@angular/material/input';
import {MatOption, MatSelect} from '@angular/material/select';
import {MatButton} from '@angular/material/button';

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
  private readonly _ageGroupStore = inject(AgeGroupStore);
  private readonly _router = inject(Router);
  private readonly _notificationService = inject(NotificationService);

  ageGroupModelSignal = linkedSignal<AgeGroupModel>(() => {
    return {
      ageLimit: 0,
      upperLimite: false,
    };
  });
  ageGroupForm = form(this.ageGroupModelSignal)

  protected submitForm(event: Event) {
    event.preventDefault();
  }
}


interface AgeGroupModel {
  ageLimit: number;
  upperLimite: boolean;
}
