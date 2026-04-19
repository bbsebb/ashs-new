import {Component, computed, inject, input} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {MatDivider} from '@angular/material/divider';
import {SeasonsStore, TeamsStore} from '@shared-api';
import {CategoryPipe, RoleStaffPipe} from '../pipes';

/**
 * Component for displaying the list of teams assigned to a staff member.
 * Can filter by season if a seasonId is provided.
 */
@Component({
  selector: 'lib-staff-teams-list',
  standalone: true,
  imports: [
    RouterLink,
    MatIcon,
    MatDivider,
    CategoryPipe,
    RoleStaffPipe
  ],
  templateUrl: './staff-teams-list.html',
  styleUrl: './staff-teams-list.scss'
})
export class StaffTeamsList {
  private readonly _teamsStore = inject(TeamsStore);
  private readonly _seasonsStore = inject(SeasonsStore);

  /** The unique identifier of the staff member. */
  staffIdSignal = input.required<string>();
  /** Optional season identifier to filter the list. */
  seasonIdSignal = input<string | undefined>(undefined);

  /**
   * Computed signal that retrieves all teams for the staff member,
   * applies optional season filtering, and enriches them with season names.
   */
  protected readonly enrichedTeamsSignal = computed(() => {
    const staffId = this.staffIdSignal();
    // Pass a signal wrapper around the raw ID to the store
    const allTeams = this._teamsStore.teamsByStaffId(computed(() => staffId))();
    const seasons = this._seasonsStore.seasonsSignal();
    const targetSeasonId = this.seasonIdSignal();

    const filteredTeams = targetSeasonId
      ? allTeams.filter(t => t.seasonId === targetSeasonId)
      : allTeams;

    return filteredTeams.map(team => {
      const season = seasons.find(s => s.id === team.seasonId);
      return {
        ...team,
        seasonName: season ? season.name : '?'
      };
    }).sort((a, b) => b.seasonName.localeCompare(a.seasonName));
  });
}
