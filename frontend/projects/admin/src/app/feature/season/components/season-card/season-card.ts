import {Component, inject, input} from '@angular/core';
import {Season} from '@shared-domain';
import {MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';
import {MatChip, MatChipSet} from '@angular/material/chips';
import {DatePipe} from '@angular/common';
import {MatButton} from '@angular/material/button';
import {Router, RouterLink} from '@angular/router';
import {SeasonsStore} from '@shared-api';
import {NotificationService} from '@shared-ui';
import {FormDeleteButton} from '../../../../shared/form-delete-button/form-delete-button';

@Component({
  selector: 'app-season-card',
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatChipSet,
    MatChip,
    MatCardContent,
    DatePipe,
    MatCardActions,
    MatButton,
    RouterLink,
    FormDeleteButton
  ],
  templateUrl: './season-card.html',
  styleUrl: './season-card.scss',
})
export class SeasonCard {
  private readonly seasonsStore = inject(SeasonsStore);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  seasonSignal = input.required<Season>({alias: 'season'});
  withActions = input<boolean>(true);

  protected onDelete() {
    this.seasonsStore.deleteById(this.seasonSignal().id).subscribe({
      next: () => {
        this.notificationService.show("Saison supprimée avec succès", 'success');
        void this.router.navigateByUrl('/seasons');
      }
    });
  }
}
