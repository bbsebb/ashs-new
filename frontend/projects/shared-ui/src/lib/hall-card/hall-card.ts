import {Component, input} from '@angular/core';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {Hall} from '@shared-domain';

@Component({
  selector: 'lib-hall-card',
  imports: [
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
  ],
  templateUrl: './hall-card.html',
  styleUrl: './hall-card.scss',
})
export class HallCard {
  hallSignal = input.required<Hall>({alias: 'hall'})
}
