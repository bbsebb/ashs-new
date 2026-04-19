/**
 * Component for viewing a single sport season detail.
 */
import {Component, effect, inject, input} from '@angular/core';
import {ErrorData, LoadingData, NotificationService, SeasonCard} from '@shared-ui';
import {SeasonsStore} from '@shared-api';
import {Router, RouterLink} from '@angular/router';
import {MatCardActions} from '@angular/material/card';
import {MatButton} from '@angular/material/button';
import {FormDeleteButton} from '../../../../shared/form-delete-button/form-delete-button';

@Component({
  selector: 'app-season-view',
  imports: [
    SeasonCard,
    LoadingData,
    ErrorData,
    MatCardActions,
    MatButton,
    RouterLink,
    FormDeleteButton
  ],
  templateUrl: './season-view.html',
  styleUrl: './season-view.scss',
})
export class SeasonView {
  private readonly seasonStore = inject(SeasonsStore);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  readonly idSignal = input.required<string>()

  seasonSignal = this.seasonStore.seasonById(this.idSignal);

  isLoadingSignal = this.seasonStore.isLoadingSignal;
  errorSignal = this.seasonStore.errorSignal;


  constructor() {
    effect(() => {
      if (!this.isLoadingSignal() && !this.errorSignal() && !this.seasonSignal()) {
        void this.router.navigateByUrl('/404');
      }
    });
  }

  protected onDelete() {
    const season = this.seasonSignal();
    if (season) {
      this.seasonStore.deleteById(season.id).subscribe({
        next: () => {
          this.notificationService.show("Saison supprimée avec succès", 'success');
          void this.router.navigateByUrl('/seasons');
        }
      });
    }
  }

  protected retry() {
    this.seasonStore.reload();
  }
}
