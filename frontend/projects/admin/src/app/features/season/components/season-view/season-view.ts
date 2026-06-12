/**
 * Component for viewing a single sport season detail.
 */
import {Component, effect, inject, input, ChangeDetectionStrategy} from '@angular/core';
import {ErrorData, LoadingData, NotificationService, SeasonCard} from '@shared-ui';
import {SeasonsStore, ViewModelMapperService} from '@shared-api';
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
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './season-view.scss',
})
export class SeasonView {
  private readonly _seasonsStore = inject(SeasonsStore)
  private readonly _viewModelMapper = inject(ViewModelMapperService)
  private readonly _router = inject(Router)
  private readonly _notificationService = inject(NotificationService)

  readonly idInputSignal = input.required<string>({alias: 'id'})

  seasonCardViewModelSignal = this._viewModelMapper.seasonCardViewModelById(this.idInputSignal);

  isLoadingSignal = this._seasonsStore.isLoadingSignal
  errorSignal = this._seasonsStore.errorSignal

  constructor() {
    effect(() => {
      if (!this.isLoadingSignal() && !this.errorSignal() && !this.seasonCardViewModelSignal()) {
        void this._router.navigateByUrl('/404')
      }
    })
  }

  protected onDelete() {
    const viewModel = this.seasonCardViewModelSignal();
    if (viewModel) {
      this._seasonsStore.deleteById(viewModel.id).subscribe({
        next: () => {
          this._notificationService.show("Saison supprimée avec succès", 'success');
          void this._router.navigateByUrl('/seasons');
        }
      });
    }
  }

  protected retry() {
    this._seasonsStore.reload();
  }
}
