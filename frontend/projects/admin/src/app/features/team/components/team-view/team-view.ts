/**
 * Component for viewing a single team detailed profile.
 */
import {Component, effect, inject, input, ChangeDetectionStrategy} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {TeamsStore, ViewModelMapperService} from '@shared-api';
import {ErrorData, LoadingData, NotificationService, TeamCard} from '@shared-ui';
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
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true
})
export class TeamView {
  private readonly _teamsStore = inject(TeamsStore);
  private readonly _viewModelMapper = inject(ViewModelMapperService);
  private readonly _router = inject(Router);
  private readonly _notificationService = inject(NotificationService);

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

  protected onDelete() {
    const viewModel = this.teamCardViewModelSignal();
    if (viewModel) {
      this._teamsStore.deleteById(viewModel.id).subscribe({
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
