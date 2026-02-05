import {Component, effect, inject, input, Signal} from '@angular/core';
import {MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';
import {MatButton} from '@angular/material/button';
import {Hall} from '@shared-domain';
import {Router, RouterLink} from '@angular/router';
import {HallsStore} from '@shared-api';
import {ErrorData, LoadingData} from '@shared-ui';

@Component({
  selector: 'app-hall-view',
  imports: [
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatButton,
    MatCardActions,
    MatCardHeader,
    RouterLink,
    ErrorData,
    LoadingData
  ],
  templateUrl: './hall-view.html',
  styleUrl: './hall-view.scss',
  standalone: true
})
export class HallView {
  private readonly hallsStore = inject(HallsStore);
  private readonly router = inject(Router);
  isLoading = this.hallsStore.isLoading;
  error = this.hallsStore.error;
  id = input.required<string>();
  hallSignal: Signal<Hall | undefined>  =  this.hallsStore.hallById(this.id);
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
