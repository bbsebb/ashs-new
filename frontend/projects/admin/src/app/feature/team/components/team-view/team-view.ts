import {Component, effect, inject, input} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {TeamsStore} from '@shared-api';
import {ErrorData, LoadingData, NotificationService} from '@shared-ui';
import {TeamCard} from '@shared-ui';
import {MatCardActions} from '@angular/material/card';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {FormDeleteButton} from '../../../../shared/form-delete-button/form-delete-button';

@Component({
  selector: 'app-team-view',
  imports: [
    ErrorData,
    LoadingData,
    TeamCard,
    MatCardActions,
    MatButton,
    MatIconButton,
    MatIcon,
    RouterLink,
    FormDeleteButton
  ],
  templateUrl: './team-view.html',
  styleUrl: './team-view.scss',
  standalone: true
})
export class TeamView {
  private readonly _teamsStore = inject(TeamsStore);
  private readonly _router = inject(Router);
  private readonly _notificationService = inject(NotificationService);

  id = input.required<string>();
  teamSignal = this._teamsStore.teamById(this.id);

  isLoading = this._teamsStore.isLoadingSignal;
  error = this._teamsStore.errorSignal;


  constructor() {
    effect(() => {
      if (!this.isLoading() && !this.error() && !this.teamSignal()) {
        void this._router.navigateByUrl('/404');
      }
    });
  }

  protected onDelete() {
    const team = this.teamSignal();
    if (team) {
      this._teamsStore.deleteById(team.id).subscribe({
        next: () => {
          this._notificationService.show("Équipe supprimée avec succès", 'success');
          void this._router.navigateByUrl('/teams');
        }
      });
    }
  }

  protected retry() {
    this._teamsStore.reload();
  }
}
