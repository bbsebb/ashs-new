import {Component, inject, signal} from '@angular/core';

import {FieldTree, form, FormField, maxLength, required, submit} from '@angular/forms/signals';
import {JsonPipe} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

import {firstValueFrom} from 'rxjs';
import {CreateHallDTO, FormErrorHandleService, HallsStore} from '@shared-api'
import {FormSubmitButton} from '@shared-ui';

@Component({
  selector: 'app-hall-form',
  imports: [
    FormField,
    JsonPipe,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormSubmitButton
  ],
  templateUrl: './hall-form.html',
  styleUrl: './hall-form.scss',
})
export class HallForm {
  private readonly formErrorHandler = inject(FormErrorHandleService);
  private readonly hallsStore = inject(HallsStore);



  hallModel = signal<CreateHallDTO>({
    name: '',
    addressStreet: '',
    addressCity: '',
    addressPostalCode: '',
    addressCountry: ''
  })

  hallForm = form(this.hallModel, (path) => {
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
  })


  protected shouldShowError(field: FieldTree<unknown>): boolean {
    const state = field();
    return state.invalid() && (state.touched() || state.dirty());
  }

  protected errorMessage(field: FieldTree<unknown>, fallback: string): string {
    const [first] = field().errors();
    return first?.message ?? fallback;
  }


  protected submitForm(event: Event) {
    event.preventDefault();

    void submit(this.hallForm, async (form) => {
      try {
        const res = await firstValueFrom(this.hallsStore.createHall(this.hallModel()));
        console.log('Succès', res);
        return undefined;
      } catch (error) {
        return this.formErrorHandler.handleError(error, form);
      }
    });
  }





}


