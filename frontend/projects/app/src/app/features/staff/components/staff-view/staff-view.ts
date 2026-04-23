/**
 * Component for displaying a staff member detail page in the public app.
 */
import {Component, effect, inject, input, signal} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {StaffsStore, ViewModelMapperService} from '@shared-api';
import {ErrorData, LoadingData, StaffCard} from '@shared-ui';
import {MatCardActions} from '@angular/material/card';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-staff-view',
  imports: [
    ErrorData,
    LoadingData,
    StaffCard,
    MatCardActions,
    MatButton,
    RouterLink,
  ],
  templateUrl: './staff-view.html',
  styleUrl: './staff-view.scss',
  standalone: true
})
export class StaffView {
  private readonly staffsStore = inject(StaffsStore);
  private readonly _viewModelMapper = inject(ViewModelMapperService);
  private readonly router = inject(Router);

  idInputSignal = input.required<string>({alias: 'id'});

  staffCardViewModelSignal = this._viewModelMapper.staffCardViewModelById(this.idInputSignal, signal(undefined));

  isLoadingSignal = this.staffsStore.isLoadingSignal;
  errorSignal = this.staffsStore.errorSignal;

  constructor() {
    effect(() => {
      if (!this.isLoadingSignal() && !this.errorSignal() && !this.staffCardViewModelSignal()) {
        void this.router.navigateByUrl('/404');
      }
    });
  }

  protected retry() {
    this.staffsStore.reload();
  }
}
