import {Component, input} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {Team} from '@shared-domain';
import {CategoryPipe, GenderPipe} from '../pipes';

/**
 * A compact team card used for quick navigation or in lists.
 * Displays gender and category badges.
 */
@Component({
  selector: 'lib-team-mini-card',
  standalone: true,
  imports: [RouterLink, MatIconModule, CategoryPipe, GenderPipe],
  templateUrl: './team-mini-card.html',
  styleUrl: './team-mini-card.scss'
})
export class TeamMiniCard {
  /**
   * The team to display.
   */
  teamSignal = input.required<Team>({alias: 'team'});
}
