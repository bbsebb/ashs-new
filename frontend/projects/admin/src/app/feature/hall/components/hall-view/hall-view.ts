import {Component, effect, inject, input} from '@angular/core';
import {Router} from '@angular/router';
import {HallsStore} from '@shared-api';
import {ErrorData, LoadingData} from '@shared-ui';
import {HallCard} from '../hall-card/hall-card';

@Component({
  selector: 'app-hall-view',
  imports: [
    ErrorData,
    LoadingData,
    HallCard
  ],
  templateUrl: './hall-view.html',
  styleUrl: './hall-view.scss',
  standalone: true
})
export class HallView {
  private readonly hallsStore = inject(HallsStore);
  private readonly router = inject(Router);

  id = input<string>();
  hallSignal = this.hallsStore.hallById(this.id);

  isLoading = this.hallsStore.isLoading;
  error = this.hallsStore.error;


  constructor() {
    effect(() => {
      if (!this.isLoading() && !this.error() && !this.hallSignal()) {
        void this.router.navigateByUrl('/404');
      }
    });
  }
  protected retry() {
    this.hallsStore.reload();
  }
}
