import {Component, input} from '@angular/core';
import {Season} from '@shared-domain';
import {MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';
import {MatChip, MatChipSet} from '@angular/material/chips';
import {DatePipe} from '@angular/common';
import {MatButton} from '@angular/material/button';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-season-card',
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatChipSet,
    MatChip,
    MatCardContent,
    DatePipe,
    MatCardActions,
    MatButton,
    RouterLink
  ],
  templateUrl: './season-card.html',
  styleUrl: './season-card.scss',
})
export class SeasonCard {
    seasonSignal = input.required<Season>({alias:'season'});
    withActions = input<boolean>(true);

}
