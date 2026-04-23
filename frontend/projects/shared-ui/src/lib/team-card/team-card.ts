import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle} from "@angular/material/card";
import {GenderPipe} from '../pipes';
import {MatIcon} from '@angular/material/icon';
import {MatDivider} from '@angular/material/divider';
import {MatChipsModule} from '@angular/material/chips';
import {StaffMiniCard} from '../staff-mini-card/staff-mini-card';
import {TrainingSessionItem} from '../training-session-item/training-session-item';
import {TeamCardViewModel} from '@shared-api';

/**
 * Component for displaying a detailed team card.
 * Purely presentational component using a ViewModel.
 */
@Component({
  selector: 'lib-team-card',
  imports: [
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatIcon,
    MatDivider,
    MatChipsModule,
    GenderPipe,
    StaffMiniCard,
    TrainingSessionItem
  ],
  templateUrl: './team-card.html',
  styleUrl: './team-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamCard {
  /**
   * The ViewModel containing all data for the card.
   */
  teamCardViewModelInputSignal = input.required<TeamCardViewModel>({alias: 'teamCardViewModel'});
}
