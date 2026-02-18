import {Component, effect, inject, input} from '@angular/core';
import {SeasonCard} from '../season-card/season-card';
import {SeasonsStore} from '@shared-api';
import {Router} from '@angular/router';
import {ErrorData, LoadingData} from '@shared-ui';

@Component({
  selector: 'app-season-view',
  imports: [
    SeasonCard,
    LoadingData,
    ErrorData
  ],
  templateUrl: './season-view.html',
  styleUrl: './season-view.scss',
})
export class SeasonView {
  private readonly seasonStore = inject(SeasonsStore);
  private readonly router = inject(Router);

  readonly id = input.required<string>()

  seasonSignal = this.seasonStore.seasonById(this.id);

  isLoading = this.seasonStore.isLoading;
  error = this.seasonStore.error;


  constructor() {
    effect(() => {
      if (!this.isLoading() && !this.error() && !this.seasonSignal()) {
        void this.router.navigateByUrl('/404');
      }
    });
  }
  protected retry() {
    this.seasonStore.reload();
  }
}
