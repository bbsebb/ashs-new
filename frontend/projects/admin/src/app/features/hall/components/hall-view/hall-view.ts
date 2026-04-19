import {Component, effect, inject, input} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {HallsStore} from '@shared-api';
import {ErrorData, HallCard, LoadingData, NotificationService} from '@shared-ui';
import {MatCardActions} from '@angular/material/card';
import {MatButton} from '@angular/material/button';
import {FormDeleteButton} from '../../../../shared/form-delete-button/form-delete-button';

/**
 * Component for viewing details of a single Hall.
 * Handles loading, error states, and deletion logic.
 */
@Component({
  selector: 'app-hall-view',
  imports: [
    ErrorData,
    LoadingData,
    HallCard,
    MatCardActions,
    MatButton,
    RouterLink,
    FormDeleteButton
  ],
  templateUrl: './hall-view.html',
  styleUrl: './hall-view.scss',
  standalone: true
})
export class HallView {
  /** Store for hall data management. */
  private readonly _hallsStore = inject(HallsStore);
  /** Router for navigation. */
  private readonly _router = inject(Router);
  /** Service for user notifications. */
  private readonly _notificationService = inject(NotificationService);

  /**
   * Required hall ID input from the route parameters.
   * Bound from the 'id' route parameter.
   */
  idInputSignal = input.required<string>({alias: 'id'});

  /**
   * Signal fetching the specific hall from the store.
   */
  hallSignal = this._hallsStore.hallById(this.idInputSignal);

  /**
   * Signal indicating if the hall data is currently being loaded.
   */
  isLoadingSignal = this._hallsStore.isLoadingSignal;

  /**
   * Signal containing any error occurred during hall data fetching.
   */
  errorSignal = this._hallsStore.errorSignal;


  constructor() {
    /**
     * Effect to redirect to 404 if the hall is not found after loading.
     */
    effect(() => {
      if (!this.isLoadingSignal() && !this.errorSignal() && !this.hallSignal()) {
        void this._router.navigateByUrl('/404');
      }
    });
  }

  /**
   * Handles the deletion of the current hall.
   * Shows a notification and navigates back to the list on success.
   */
  protected onDelete() {
    const hall = this.hallSignal();
    if (hall) {
      this._hallsStore.deleteById(hall.id).subscribe({
        next: () => {
          this._notificationService.show("Salle supprimée avec succès", 'success');
          void this._router.navigateByUrl('/halls');
        }
      });
    }
  }

  /**
   * Retries fetching data from the store.
   */
  protected retry() {
    this._hallsStore.reload();
  }
}
