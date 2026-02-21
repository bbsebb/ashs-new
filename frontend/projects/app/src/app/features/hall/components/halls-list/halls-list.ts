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
  hallsSignal = this.hallsStore.halls;
  isLoading = this.hallsStore.isLoading;
  error = this.hallsStore.error;

  protected retry() {
    this.hallsStore.reload();
  }
}
