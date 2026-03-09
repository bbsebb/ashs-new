import {Component, effect, inject, input} from '@angular/core';
import {Router} from '@angular/router';
import {StaffsStore} from '@shared-api';
import {ErrorData, LoadingData} from '@shared-ui';
import {StaffCard} from '../staff-card/staff-card';

@Component({
  selector: 'app-staff-view',
  imports: [
    ErrorData,
    LoadingData,
    StaffCard
  ],
  templateUrl: './staff-view.html',
  styleUrl: './staff-view.scss',
  standalone: true
})
export class StaffView {
  private readonly staffsStore = inject(StaffsStore);
  private readonly router = inject(Router);

  id = input.required<string>();
  staffSignal = this.staffsStore.staffById(this.id);

  isLoading = this.staffsStore.isLoading;
  error = this.staffsStore.error;


  constructor() {
    effect(() => {
      if (!this.isLoading() && !this.error() && !this.staffSignal()) {
        void this.router.navigateByUrl('/404');
      }
    });
  }
  protected retry() {
    this.staffsStore.reload();
  }
}
