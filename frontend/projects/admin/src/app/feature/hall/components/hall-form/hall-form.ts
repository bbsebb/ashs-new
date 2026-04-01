import {Component, computed, inject, input, linkedSignal, Signal} from '@angular/core';

import {FieldTree, form, FormField, maxLength, required, submit} from '@angular/forms/signals';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

import {firstValueFrom, tap} from 'rxjs';
import {FormErrorHandleService, HallsStore} from '@shared-api'
import {FormFieldErrorDirective, FormSubmitButton, NotificationService, PageTitle} from '@shared-ui';
import {Hall} from '@shared-domain';
import {Router} from '@angular/router';
import {HallCard} from '@shared-ui';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-hall-form',
  imports: [
    FormField,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormSubmitButton,
    PageTitle,
    FormFieldErrorDirective,
    HallCard
  ],
  templateUrl: './hall-form.html',
  styleUrl: './hall-form.scss',
})
export class HallForm {
  private readonly _formErrorHandler = inject(FormErrorHandleService);
  private readonly _hallsStore = inject(HallsStore);
  private readonly _router = inject(Router);
  private readonly _notificationService = inject(NotificationService);
  private readonly _dialogReference = inject(MatDialogRef, {optional: true});

  isLoading = this._hallsStore.isLoadingSignal;
  error = computed(() => !!this._hallsStore.errorSignal());
  id = input<string | undefined>(undefined);
  hallSignal: Signal<Hall | undefined> = this._hallsStore.hallById(this.id);
  isCreateForm = computed(() => !this.id());

  // Form model reset automatically when hallSignal changes
  hallModelSignal = linkedSignal<HallFormeModel>(() => {
    const hall = this.hallSignal();
    return {
      name: hall?.name ?? '',
      addressStreet: hall?.addressStreet ?? '',
      addressCity: hall?.addressCity ?? '',
      addressPostalCode: hall?.addressPostalCode ?? '',
      addressCountry: hall?.addressCountry ?? ''
    };
  });

  hallPreview = computed(() => this.hallModelSignal() as Hall);
  hallForm = this.buildForm();

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
    });
  }

  protected submitForm(event: Event) {
    event.preventDefault();
    const currentId = this.id();

    void submit(this.hallForm, async (form) => {
      try {
        let resultId = currentId;
        let createdOrUpdatedHall: Hall | undefined;

        if (!currentId) {
          createdOrUpdatedHall = await firstValueFrom(this._hallsStore.createHall(this.hallModelSignal()).pipe(
            tap(() => this._notificationService.show('La salle a été enregistrée', 'success'))
          ));
          resultId = createdOrUpdatedHall.id;
        } else {
          createdOrUpdatedHall = await firstValueFrom(this._hallsStore.updateHall(currentId, this.hallModelSignal()).pipe(
            tap(() => this._notificationService.show('La salle a été mise à jour', 'success'))
          ));
        }

        if (this._dialogReference) {
          this._dialogReference.close(createdOrUpdatedHall);
        } else {
          await this._router.navigateByUrl(`/halls/${resultId}`);
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
      void this._router.navigateByUrl(`/halls`);
    }
  }
}

type HallFormeModel = Omit<Hall, 'id'>;

