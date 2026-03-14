import {Component, effect, inject} from '@angular/core';
import {MatSelectChange, MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {SeasonsStore} from '@shared-api';
import {FormsModule} from '@angular/forms';
import {SelectedSeason} from '../../../../shared/services/selected-season';
import {Season} from '@shared-domain';
import {Router} from '@angular/router';

@Component({
  selector: 'app-right-menu',
  imports: [MatFormFieldModule, MatSelectModule, FormsModule],
  templateUrl: './right-menu.html',
  styleUrl: './right-menu.scss',
})
export class RightMenu {
  private readonly _router = inject(Router);
  private readonly _seasonStore = inject(SeasonsStore);
  private readonly _selectedSaisonService = inject(SelectedSeason);
  selected: Season | undefined = undefined;
  seasonsSignal = this._seasonStore.seasonsSignal;

  constructor() {
    effect(() => {
      this.selected = this._selectedSaisonService.selectedSeasonSignal();
    });
  }

  protected addSeason() {
    void this._router.navigate(['/seasons/create']);
  }

  protected onChange($event: MatSelectChange<Season>) {
    this._selectedSaisonService.onChangeSeason($event.value)
  }
}
