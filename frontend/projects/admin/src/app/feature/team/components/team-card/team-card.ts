import {Component, inject, input} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {Router, RouterLink} from "@angular/router";
import {Team} from '@shared-domain';
import {TeamsStore} from '@shared-api';
import {NotificationService} from '@shared-ui';
import {FormDeleteButton} from '../../../../shared/form-delete-button/form-delete-button';

@Component({
  selector: 'app-team-card',
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
  templateUrl: './team-card.html',
  styleUrl: './team-card.scss',
})
export class TeamCard {
  private readonly _teamsStore = inject(TeamsStore);
  private readonly _notificationService = inject(NotificationService);
  private readonly _router = inject(Router);

  teamSignal = input.required<Team>({alias: 'team'})
  withActions = input<boolean>(true);

  protected onDelete() {
    this._teamsStore.deleteById(this.teamSignal().id).subscribe({
      next: () => {
        this._notificationService.show("Équipe supprimée avec succès", 'success');
        void this._router.navigateByUrl('/teams');
      }
    });
  }
}
