import {Component, input} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {RouterLink} from "@angular/router";
import {Hall} from '@shared-domain';

@Component({
  selector: 'app-hall-card',
    imports: [
        MatButton,
        MatCard,
        MatCardActions,
        MatCardContent,
        MatCardHeader,
        MatCardTitle,
        RouterLink
    ],
  templateUrl: './hall-card.html',
  styleUrl: './hall-card.scss',
})
export class HallCard {
    hallSignal = input.required<Hall>({alias: 'hall'})
    withActions = input<boolean>(true);
}
