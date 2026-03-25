import {Component, computed, inject, signal, WritableSignal} from '@angular/core';
import {email, FieldTree, form, FormField, maxLength, minLength, required, submit} from '@angular/forms/signals';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {firstValueFrom, tap} from 'rxjs';

import {ContactGateway, FormErrorHandleService} from '@shared-api';

import {FormSubmitButton} from '../form-submit-button/form-submit-button';

import {PageTitle} from '../page-title/page-title';
import {NotificationService} from '../notification/notification-service';
import {FormFieldErrorDirective} from '../form-field-error/form-field-error';

@Component({
  selector: 'app-contact',
  imports: [
    FormField,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormSubmitButton,
    PageTitle,
    FormFieldErrorDirective,
  ],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  private readonly contactGateway = inject(ContactGateway);
  private readonly formErrorHandler = inject(FormErrorHandleService);
  private readonly notificationService = inject(NotificationService);

  contactModel = this.buildModel();
  contactForm = this.buildForm();

  // Optionnel, utile si tu veux afficher un aperçu/debug
  contactPreview = computed(() => this.contactModel());

  private buildModel(): WritableSignal<ContactFormModel> {
    return signal<ContactFormModel>({
      from: '',
      subject: '',
      content: '',
    });
  }

  private buildForm(): FieldTree<ContactFormModel> {
    return form(this.contactModel, (path) => {
      required(path.from, {message: "L'email est requis."});
      email(path.from, {message: "L'email n'est pas valide."});
      maxLength(path.from, 254, {message: "L'email ne doit pas dépasser 254 caractères."});

      required(path.subject, {message: 'Le sujet est requis.'});
      maxLength(path.subject, 100, {message: 'Le sujet ne doit pas dépasser 100 caractères.'});
      minLength(path.subject, 5, {message: 'Le sujet doit contenir au moins 5 caractères.'});

      required(path.content, {message: 'Le message est requis.'});
      maxLength(path.content, 2000, {message: 'Le message ne doit pas dépasser 2000 caractères.'});
      minLength(path.content, 10, {message: 'Le message doit contenir au moins 10 caractères.'});
    });
  }

  protected submitForm(event: Event) {
    event.preventDefault();

    void submit(this.contactForm, async (formState) => {
      try {
        const {from, subject, content} = this.contactModel();

        await firstValueFrom(
          this.contactGateway.contactSubmission(from, subject, content).pipe(
            tap(() => this.notificationService.show('Message envoyé.', 'success')),
          ),
        );

        // Reset simple (optionnel)
        this.contactModel.set({from: '', subject: '', content: ''});

        return undefined;
      } catch (error) {
        const result = this.formErrorHandler.handleError(error, formState);
        if (typeof result === 'string') {
          this.notificationService.show(result, 'error');
          return undefined;
        }
        return result;
      }
    });
  }
}

type ContactFormModel = {
  from: string;
  subject: string;
  content: string;
};
