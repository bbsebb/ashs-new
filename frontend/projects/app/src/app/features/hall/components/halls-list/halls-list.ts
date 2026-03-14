import {Component, inject} from '@angular/core';
import {HallsStore} from '@shared-api';
import {ErrorData, LoadingData} from '@shared-ui';
import {HallCard} from '../hall-card/hall-card';

@Component({
  selector: 'app-halls-list',
  imports: [
    LoadingData,
    ErrorData,
    HallCard
  ],
  templateUrl: './halls-list.html',
  styleUrl: './halls-list.scss',
})
export class HallsList {
  private readonly hallsStore = inject(HallsStore);
  hallsSignal = this.hallsStore.hallsSignal;
  isLoading = this.hallsStore.isLoadingSignal;
  error = this.hallsStore.errorSignal;

  protected retry() {
    this.hallsStore.reload();
  }
}
