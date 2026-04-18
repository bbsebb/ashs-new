import {Component, computed, inject, input} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {MatDivider} from '@angular/material/divider';
import {SeasonsStore, TeamsStore} from '@shared-api';
import {CategoryPipe, RoleStaffPipe} from '../pipes';

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

  staffId = input.required<string>();
  seasonId = input<string | undefined>(undefined);

  // Extraction et enrichissement des équipes
  protected readonly enrichedTeamsSignal = computed(() => {
    const staffId = this.staffId();
    const allTeams = this._teamsStore.teamsByStaffId(computed(() => staffId))();
    const seasons = this._seasonsStore.seasonsSignal();
    const targetSeasonId = this.seasonId();

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
