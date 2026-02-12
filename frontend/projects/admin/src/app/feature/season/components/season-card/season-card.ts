import {Component, input} from '@angular/core';
import {Season} from '@shared-domain';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';
import {MatChip, MatChipSet} from '@angular/material/chips';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-season-card',
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatChipSet,
    MatChip,
    MatCardContent,
    DatePipe
  ],
  templateUrl: './season-card.html',
  styleUrl: './season-card.scss',
})
export class SeasonCard {
    seasonSignal = input.required<Season>({alias:'season'});
    withActions = input<boolean>(true);
}
