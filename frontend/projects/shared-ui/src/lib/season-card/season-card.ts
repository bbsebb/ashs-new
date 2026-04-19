import {Component, input} from '@angular/core';
import {Season} from '@shared-domain';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';
import {MatChip, MatChipSet} from '@angular/material/chips';
import {DatePipe} from '@angular/common';

/**
 * Component for displaying a summarized view of a season.
 * Shows the season name, its duration (start and end dates), and its status badges.
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
})
export class SeasonCard {
  /**
   * The season object to display.
   */
  seasonInputSignal = input.required<Season>({alias: 'season'});
}
