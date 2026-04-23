import {ChangeDetectionStrategy, Component, effect, input, output, signal, WritableSignal} from '@angular/core';
import {email, FieldTree, form, FormField, maxLength, minLength, required, submit} from '@angular/forms/signals';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

import {ContactSubmitEvent, ContactViewModel} from '@shared-api';

import {FormSubmitButton} from '../form-submit-button/form-submit-button';

import {PageTitle} from '../page-title/page-title';
import {FormFieldErrorDirective} from '../form-field-error/form-field-error';

/**
 * Contact form component using Signal-based forms and validation.
 * Purely presentational component that emits an event on submission.
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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Contact {
  /** The ViewModel containing all data for the card. */
  contactViewModelInputSignal = input.required<ContactViewModel>({alias: 'contactViewModel'});

  /** True when the form is being submitted by the parent. */
  isSubmittingInputSignal = input<boolean>(false, {alias: 'isSubmitting'});

  /** Emitted when the user submits the form. */
  submitted = output<ContactSubmitEvent>();

  /** Writable Signal representing the raw form data. */
  contactModelSignal = this.buildModel();

  /** The signal-based form tree derived from the model. */
  contactFormSignal = this.buildForm();

  constructor() {
    // Reset form when submission is complete and was successful
    effect(() => {
      if (!this.isSubmittingInputSignal()) {
        // We could reset here if needed, but usually the parent handles success state
      }
    });
  }

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
   * Triggers the form submission event.
   * @param event The submit event from the template.
   */
  protected onSubmitForm(event: Event) {
    event.preventDefault();
    void submit(this.contactFormSignal, async () => {
      this.submitted.emit(this.contactModelSignal());
      return undefined;
    });
  }

  /** Public method to reset the form, intended to be called by parent via template ref if needed. */
  resetForm() {
    this.contactModelSignal.set({from: '', subject: '', content: ''});
  }
}

/** Internal DTO for the contact form state. */
type ContactFormModel = ContactSubmitEvent;
