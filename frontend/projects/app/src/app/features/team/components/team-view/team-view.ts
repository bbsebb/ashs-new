import {Component, effect, inject, input} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {TeamsStore} from '@shared-api';
import {ErrorData, LoadingData, TeamCard} from '@shared-ui';
import {MatCardActions} from '@angular/material/card';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-team-view',
  imports: [
    ErrorData,
    LoadingData,
    TeamCard,
    MatCardActions,
    MatButton,
    RouterLink
  ],
  templateUrl: './team-view.html',
  styleUrl: './team-view.scss',
  standalone: true
})
export class TeamView {
  private readonly _teamsStore = inject(TeamsStore);
  private readonly _router = inject(Router);

  id = input.required<string>();
  teamSignal = this._teamsStore.teamById(this.id);

  isLoadingSignal = this._teamsStore.isLoadingSignal;
  errorSignal = this._teamsStore.errorSignal;

  constructor() {
    effect(() => {
      if (!this.isLoadingSignal() && !this.errorSignal() && !this.teamSignal()) {
        void this._router.navigateByUrl('/404');
      }
    });
  }

  protected retry() {
    this._teamsStore.reload();
  }
}
