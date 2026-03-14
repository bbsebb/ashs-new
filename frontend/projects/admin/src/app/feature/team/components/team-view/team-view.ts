import {Component, effect, inject, input} from '@angular/core';
import {Router} from '@angular/router';
import {TeamsStore} from '@shared-api';
import {ErrorData, LoadingData} from '@shared-ui';
import {TeamCard} from '../team-card/team-card';

@Component({
  selector: 'app-team-view',
  imports: [
    ErrorData,
    LoadingData,
    TeamCard
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

  isLoading = this._teamsStore.isLoadingSignal;
  error = this._teamsStore.errorSignal;


  constructor() {
    effect(() => {
      if (!this.isLoading() && !this.error() && !this.teamSignal()) {
        void this._router.navigateByUrl('/404');
      }
    });
  }
  protected retry() {
    this._teamsStore.reload();
  }
}
