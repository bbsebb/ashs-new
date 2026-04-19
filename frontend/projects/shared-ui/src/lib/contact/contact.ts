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

/**
 * Contact form component using Signal-based forms and validation.
 * Handles the club contact logic via the ContactGateway.
 */
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

  /** Writable Signal representing the raw form data. */
  contactModelSignal = this.buildModel();

  /** The signal-based form tree derived from the model. */
  contactFormSignal = this.buildForm();

  /** Optional preview of the current model state. */
  contactPreviewSignal = computed(() => this.contactModelSignal());

  /**
   * Initializes the form model with empty values.
   */
  private buildModel(): WritableSignal<ContactFormModel> {
    return signal<ContactFormModel>({
      from: '',
      subject: '',
      content: '',
    });
  }

  /**
   * Defines the validation rules for each form field.
   */
  private buildForm(): FieldTree<ContactFormModel> {
    return form(this.contactModelSignal, (path) => {
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

  /**
   * Triggers the form submission process.
   * Resets the form upon success and handles errors via the FormErrorHandleService.
   *
   * @param event The submit event from the template.
   */
  protected submitForm(event: Event) {
    event.preventDefault();

    void submit(this.contactFormSignal, async (formState) => {
      try {
        const {from, subject, content} = this.contactModelSignal();

        await firstValueFrom(
          this.contactGateway.contactSubmission(from, subject, content).pipe(
            tap(() => this.notificationService.show('Message envoyé.', 'success')),
          ),
        );

        // Reset the form model
        this.contactModelSignal.set({from: '', subject: '', content: ''});

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

/** Internal DTO for the contact form state. */
type ContactFormModel = {
  /** The sender's email address. */
  from: string;
  /** The subject of the message. */
  subject: string;
  /** The main message content. */
  content: string;
};
