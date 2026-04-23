import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatDividerModule} from "@angular/material/divider";
import {SafePipe} from "../pipes";
import {HallCardViewModel} from '@shared-api';

/**
 * Component for displaying a card with information about a sports hall.
 * Purely presentational component using a ViewModel.
 */
@Component({
  selector: 'lib-hall-card',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDividerModule,
    SafePipe,
  ],
  templateUrl: './hall-card.html',
  styleUrl: './hall-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HallCard {
  /**
   * The ViewModel containing all data for the card.
   */
  hallCardViewModelInputSignal = input.required<HallCardViewModel>({alias: 'hallCardViewModel'})
}
