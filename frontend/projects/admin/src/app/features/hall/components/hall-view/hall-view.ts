import {Component, effect, inject, input} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {HallsStore} from '@shared-api';
import {ErrorData, HallCard, LoadingData, NotificationService} from '@shared-ui';
import {MatCardActions} from '@angular/material/card';
import {MatButton} from '@angular/material/button';
import {FormDeleteButton} from '../../../../shared/form-delete-button/form-delete-button';

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
  private readonly hallsStore = inject(HallsStore);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  id = input.required<string>();
  hallSignal = this.hallsStore.hallById(this.id);

  isLoadingSignal = this.hallsStore.isLoadingSignal;
  errorSignal = this.hallsStore.errorSignal;


  constructor() {
    effect(() => {
      if (!this.isLoadingSignal() && !this.errorSignal() && !this.hallSignal()) {
        void this.router.navigateByUrl('/404');
      }
    });
  }

  protected onDelete() {
    const hall = this.hallSignal();
    if (hall) {
      this.hallsStore.deleteById(hall.id).subscribe({
        next: () => {
          this.notificationService.show("Salle supprimée avec succès", 'success');
          void this.router.navigateByUrl('/halls');
        }
      });
    }
  }

  protected retry() {
    this.hallsStore.reload();
  }
}
