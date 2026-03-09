import {Component, inject, input} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {Router, RouterLink} from "@angular/router";
import {Hall} from '@shared-domain';
import {HallsStore} from '@shared-api';
import {NotificationService} from '@shared-ui';
import {FormDeleteButton} from '../../../../shared/form-delete-button/form-delete-button';

@Component({
  selector: 'app-hall-card',
  imports: [
    MatButton,
    MatCard,
    MatCardActions,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    RouterLink,
    FormDeleteButton
  ],
  templateUrl: './hall-card.html',
  styleUrl: './hall-card.scss',
})
export class HallCard {
  private readonly hallsStore = inject(HallsStore);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  hallSignal = input.required<Hall>({alias: 'hall'})
  withActions = input<boolean>(true);

  protected onDelete() {
    this.hallsStore.deleteById(this.hallSignal().id).subscribe({
      next: () => {
        this.notificationService.show("Salle supprimée avec succès", 'success');
        void this.router.navigateByUrl('/halls');
      }
    });
  }
}

