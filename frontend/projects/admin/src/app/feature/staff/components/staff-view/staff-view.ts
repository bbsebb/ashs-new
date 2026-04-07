import {Component, effect, inject, input} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {StaffsStore} from '@shared-api';
import {ErrorData, LoadingData, NotificationService} from '@shared-ui';
import {StaffCard} from '@shared-ui';
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
  standalone: true
})
export class StaffView {
  private readonly staffsStore = inject(StaffsStore);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  id = input.required<string>();
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

  protected onDelete() {
    const staff = this.staffSignal();
    if (staff) {
      this.staffsStore.deleteById(staff.id).subscribe({
        next: () => {
          this.notificationService.show("Membre de l'encadrement supprimé avec succès", 'success');
          void this.router.navigateByUrl('/staffs');
        }
      });
    }
  }

  protected retry() {
    this.staffsStore.reload();
  }
}
