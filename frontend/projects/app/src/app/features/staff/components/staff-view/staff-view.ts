import {Component, effect, inject, input} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {StaffsStore} from '@shared-api';
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
  private readonly router = inject(Router);

  id = input.required<string>();
  // On passe directement le signal 'this.id' (sans les parenthèses) au store
  staffSignal = this.staffsStore.staffById(this.id);

  isLoadingSignal = this.staffsStore.isLoadingSignal;
  errorSignal = this.staffsStore.errorSignal;

  constructor() {
    effect(() => {
      if (!this.isLoadingSignal() && !this.errorSignal() && !this.staffSignal()) {
        void this.router.navigateByUrl('/404');
      }
    });
  }

  protected retry() {
    this.staffsStore.reload();
  }
}
