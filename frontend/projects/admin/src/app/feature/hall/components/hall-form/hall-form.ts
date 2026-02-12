import {Component, computed, effect, inject, input, Signal, signal, WritableSignal} from '@angular/core';

import {FieldTree, form, FormField, maxLength, required, submit} from '@angular/forms/signals';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

import {firstValueFrom, tap} from 'rxjs';
import {FormErrorHandleService, HallsStore} from '@shared-api'
import {FormFieldErrorDirective, FormSubmitButton, NotificationService, PageTitle} from '@shared-ui';
import {Hall} from '@shared-domain';
import {Router, RouterLink} from '@angular/router';
import {HallCard} from '../hall-card/hall-card';

@Component({
  selector: 'app-hall-form',
  imports: [
    FormField,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormSubmitButton,
    RouterLink,
    PageTitle,
    FormFieldErrorDirective,
    HallCard
  ],
  templateUrl: './hall-form.html',
  styleUrl: './hall-form.scss',
})
export class HallForm {
  private readonly formErrorHandler = inject(FormErrorHandleService);
  private readonly hallsStore = inject(HallsStore);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  isLoading = this.hallsStore.isLoading;
  error = computed(() => !!this.hallsStore.error);
  id = input<string | undefined>(undefined);
  hallSignal: Signal<Hall | undefined> = this.hallsStore.hallById(this.id);
  isCreateForm = computed(() => !this.id());  // Or it's a "edit" form if id is defined.
  hallModel = this.buildModel();
  hallPreview = computed(() =>  this.hallModel() as Hall);
  hallForm = this.buildForm();

  constructor() {
    effect(() => {
      const hall = this.hallSignal();
      if (hall) this.hallModel.set({
        name: hall.name,
        addressStreet: hall.addressStreet,
        addressCity: hall.addressCity,
        addressPostalCode: hall.addressPostalCode,
        addressCountry: hall.addressCountry
      })
    });
  }

  private buildModel(): WritableSignal<HallFormeModel> {
    return signal<HallFormeModel>({
      name: '',
      addressStreet: '',
      addressCity: '',
      addressPostalCode: '',
      addressCountry: ''
    })
  }

  private buildForm(): FieldTree<HallFormeModel> {
    return form(this.hallModel, (path) => {
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
    const id = this.id();

    void submit(this.hallForm, async (form) => {
      try {
        if (!id) {
          await firstValueFrom(this.hallsStore.createHall(this.hallModel()).pipe(
            tap(() => this.notificationService.show('La salle a été enregistrée','success'))
          ));
        } else {
           await firstValueFrom(this.hallsStore.updateHall(id, this.hallModel()).pipe(
            tap(() => this.notificationService.show('La salle a été mise à jour','success'))
          ));
        }
        await this.router.navigateByUrl('/halls');
        return undefined;
      } catch (error) {
        return this.formErrorHandler.handleError(error, form);
      }
    });

  }
}

type HallFormeModel = Omit<Hall, 'id'>;

