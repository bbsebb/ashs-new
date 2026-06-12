/**
 * Component for displaying a team detail page in the public app.
 */
import {Component, effect, inject, input, ChangeDetectionStrategy} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {TeamsStore, ViewModelMapperService} from '@shared-api';
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
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true
})
export class TeamView {
  private readonly _teamsStore = inject(TeamsStore);
  private readonly _viewModelMapper = inject(ViewModelMapperService);
  private readonly _router = inject(Router);

  idInputSignal = input.required<string>({alias: 'id'});

  teamCardViewModelSignal = this._viewModelMapper.teamCardViewModelById(this.idInputSignal);
  isLoadingSignal = this._teamsStore.isLoadingSignal;
  errorSignal = this._teamsStore.errorSignal;

  constructor() {
    effect(() => {
      if (!this.isLoadingSignal() && !this.errorSignal() && !this.teamCardViewModelSignal()) {
        void this._router.navigateByUrl('/404');
      }
    });
  }


  protected retry() {
    this._teamsStore.reload();
  }
}
