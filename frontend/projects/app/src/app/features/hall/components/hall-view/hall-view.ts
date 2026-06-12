/**
 * Component for displaying a hall detail page in the public app.
 */
import {Component, effect, inject, input, ChangeDetectionStrategy} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {HallsStore, ViewModelMapperService} from '@shared-api';
import {ErrorData, HallCard, LoadingData} from '@shared-ui';
import {MatCardActions} from '@angular/material/card';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-hall-view',
  imports: [
    ErrorData,
    LoadingData,
    HallCard,
    MatCardActions,
    MatButton,
    RouterLink,
  ],
  templateUrl: './hall-view.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true
})
export class HallView {
  private readonly hallsStore = inject(HallsStore);
  private readonly _viewModelMapper = inject(ViewModelMapperService);
  private readonly _router = inject(Router);

  idInputSignal = input.required<string>({alias: 'id'});

  hallCardViewModelSignal = this._viewModelMapper.hallCardViewModelById(this.idInputSignal);
  isLoadingSignal = this.hallsStore.isLoadingSignal;
  errorSignal = this.hallsStore.errorSignal;

  constructor() {
    effect(() => {
      if (!this.isLoadingSignal() && !this.errorSignal() && !this.hallCardViewModelSignal()) {
        void this._router.navigateByUrl('/404');
      }
    });
  }


  protected retry() {
    this.hallsStore.reload();
  }
}
