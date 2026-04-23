import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {MatDivider} from '@angular/material/divider';
import {StaffTeamViewModel} from '@shared-api';

/**
 * Component for displaying the list of teams assigned to a staff member.
 * Purely presentational component receiving mapped data.
 */
@Component({
  selector: 'lib-staff-teams-list',
  standalone: true,
  imports: [
    RouterLink,
    MatIcon,
    MatDivider
  ],
  templateUrl: './staff-teams-list.html',
  styleUrl: './staff-teams-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StaffTeamsList {
  /** The list of teams to display. */
  staffTeamsInputSignal = input.required<StaffTeamViewModel[]>({alias: 'staffTeams'});
  /** Whether to show the season badge (usually true for history, false for current season view). */
  showSeasonInputSignal = input<boolean>(true, {alias: 'showSeason'});
}
