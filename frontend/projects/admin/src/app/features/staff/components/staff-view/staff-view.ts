/**
 * Component for viewing a staff member detail profile.
 */
import {Component, effect, inject, input, signal, ChangeDetectionStrategy} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {StaffsStore, ViewModelMapperService} from '@shared-api';
import {ErrorData, LoadingData, NotificationService, StaffCard} from '@shared-ui';
import {MatCardActions} from '@angular/material/card';
import {MatButton} from '@angular/material/button';
import {FormDeleteButton} from '../../../../shared/form-delete-button/form-delete-button';

@Component({
  selector: 'app-staff-view',
  imports: [
    ErrorData,
    LoadingData,
    StaffCard,
    MatCardActions,
    MatButton,
    RouterLink,
    FormDeleteButton
  ],
  templateUrl: './staff-view.html',
  styleUrl: './staff-view.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true
})
export class StaffView {
  private readonly _staffsStore = inject(StaffsStore);
  private readonly _viewModelMapper = inject(ViewModelMapperService);
  private readonly _router = inject(Router);
  private readonly _notificationService = inject(NotificationService);

  idInputSignal = input.required<string>({alias: 'id'});

  staffCardViewModelSignal = this._viewModelMapper.staffCardViewModelById(this.idInputSignal, signal(undefined));

  isLoadingSignal = this._staffsStore.isLoadingSignal;
  errorSignal = this._staffsStore.errorSignal;

  constructor() {
    effect(() => {
      if (!this.isLoadingSignal() && !this.errorSignal() && !this.staffCardViewModelSignal()) {
        void this._router.navigateByUrl('/404');
      }
    });
  }


  protected onDelete() {
    const viewModel = this.staffCardViewModelSignal();
    if (viewModel) {
      this._staffsStore.deleteById(viewModel.id).subscribe({
        next: () => {
          this._notificationService.show("Membre de l'encadrement supprimé avec succès", 'success');
          void this._router.navigateByUrl('/staffs');
        }
      });
    }
  }

  protected retry() {
    this._staffsStore.reload();
  }
}
