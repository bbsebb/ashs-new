import {inject, Injectable, linkedSignal} from '@angular/core';
import {SeasonsStore} from '@shared-api';
import {Season} from '@shared-domain';

@Injectable({
  providedIn: 'root',
})
export class SelectedSeason {
  private readonly _seasonStore = inject(SeasonsStore);
  private readonly _selectedSeasonSignal = linkedSignal(() => this._seasonStore.seasonsSignal().find((s: Season) => s.isCurrent))
  selectedSeasonSignal = this._selectedSeasonSignal.asReadonly();

  onChangeSeason(season: Season) {
    this._selectedSeasonSignal.set(season);
  }
}
