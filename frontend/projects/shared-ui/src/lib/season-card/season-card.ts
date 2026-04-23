import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';
import {MatChip, MatChipSet} from '@angular/material/chips';
import {DatePipe} from '@angular/common';
import {SeasonCardViewModel} from '@shared-api';

/**
 * Component for displaying a summarized view of a season.
 * Purely presentational component using a ViewModel.
 */
@Component({
  selector: 'lib-season-card',
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatChipSet,
    MatChip,
    MatCardContent,
    DatePipe,
  ],
  templateUrl: './season-card.html',
  styleUrl: './season-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeasonCard {
  /**
   * The ViewModel containing all data for the card.
   */
  seasonCardViewModelInputSignal = input.required<SeasonCardViewModel>({alias: 'seasonCardViewModel'});
}
