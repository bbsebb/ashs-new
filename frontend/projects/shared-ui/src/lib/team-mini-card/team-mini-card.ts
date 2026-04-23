import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {TeamMiniCardViewModel} from '@shared-api';

/**
 * A compact team card used for quick navigation or in lists.
 * Purely presentational component using a ViewModel.
 */
@Component({
  selector: 'lib-team-mini-card',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  templateUrl: './team-mini-card.html',
  styleUrl: './team-mini-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamMiniCard {
  /**
   * The ViewModel containing all data for the card.
   */
  teamMiniCardViewModelInputSignal = input.required<TeamMiniCardViewModel>({alias: 'teamMiniCardViewModel'});
}
