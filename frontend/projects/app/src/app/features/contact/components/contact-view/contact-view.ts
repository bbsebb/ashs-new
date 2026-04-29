import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Contact, NotificationService} from '@shared-ui';
import {APP_CONFIG, ContactSubmitEvent, ContactViewModel} from '@shared-api';
import {finalize} from 'rxjs';

/**
 * Smart component for the Contact page.
 * Orchestrates the contact form logic and handles API submission.
 */
@Component({
  selector: 'app-contact-view',
  imports: [
    Contact
  ],
  templateUrl: './contact-view.html',
  styleUrl: './contact-view.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactView {
  private readonly _httpClient = inject(HttpClient);
  private readonly _appConfig = inject(APP_CONFIG);
  private readonly _notificationService = inject(NotificationService);

  /** ViewModel for the presentational contact component. */
  readonly contactViewModelSignal = computed<ContactViewModel>(() => ({
    eyebrow: 'Contact',
    title: 'Une question ?',
    subtitle: 'N’hésitez pas à nous contacter via ce formulaire.',
  }));

  /** Loading state during form submission. */
  readonly isSubmittingSignal = signal(false);

  /**
   * Handles the form submission by calling the backend API.
   * @param event The data emitted by the contact form.
   */
  onSubmit(event: ContactSubmitEvent): void {
    this.isSubmittingSignal.set(true);
    this._httpClient.post(`${this._appConfig.apiUrl}/api/v1/contact/send`, event)
      .pipe(finalize(() => this.isSubmittingSignal.set(false)))
      .subscribe({
        next: () => {
          this._notificationService.show('Votre message a été envoyé avec succès.', 'success');
        },
        error: () => {
          this._notificationService.show('Une erreur est survenue lors de l’envoi du message.', 'error');
        }
      });
  }
}
