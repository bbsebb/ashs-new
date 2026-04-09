import { Component, inject } from '@angular/core';
import { StaffsStore } from '@shared-api';
import { ErrorData, LoadingData, PublicPageContainer, StaffCard } from '@shared-ui';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-staffs-list',
  standalone: true,
  imports: [
    LoadingData,
    ErrorData,
    PublicPageContainer,
    StaffCard,
    MatIconModule
  ],
  templateUrl: './staffs-list.html',
  styleUrl: './staffs-list.scss'
})
export class StaffsList {
  private readonly staffsStore = inject(StaffsStore);
  staffsSignal = this.staffsStore.staffsSignal;
  isLoadingSignal = this.staffsStore.isLoadingSignal;
  errorSignal = this.staffsStore.errorSignal;

  protected retry() {
    this.staffsStore.reload();
  }
}
