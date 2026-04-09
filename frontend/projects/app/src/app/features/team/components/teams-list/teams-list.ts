import { Component, computed, inject, linkedSignal } from '@angular/core';
import { SeasonsStore, TeamsStore } from '@shared-api';
import { ErrorData, LoadingData, PageTitle, TeamCard } from '@shared-ui';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

@Component({
  selector: 'app-teams-list',
  standalone: true,
  imports: [
    LoadingData,
    ErrorData,
    PageTitle,
    TeamCard,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule
  ],
  templateUrl: './teams-list.html',
  styleUrl: './teams-list.scss'
})
export class TeamsList {
  private readonly teamsStore = inject(TeamsStore);
  private readonly seasonsStore = inject(SeasonsStore);

  seasonsSignal = this.seasonsStore.seasonsSignal;
  
  /**
   * Automatically resets or initializes the selected season when the seasons list changes.
   * Prefers the current season, otherwise the first one available.
   */
  selectedSeasonIdSignal = linkedSignal<string | null>(() => {
    const seasons = this.seasonsSignal();
    if (seasons.length === 0) return null;
    const current = seasons.find(s => s.isCurrent) || seasons[0];
    return current.id;
  });

  isLoadingSignal = computed(() => this.teamsStore.isLoadingSignal() || this.seasonsStore.isLoadingSignal());
  errorSignal = computed(() => this.teamsStore.errorSignal() || this.seasonsStore.errorSignal());

  filteredTeamsSignal = computed(() => {
    const teams = this.teamsStore.teamsSignal();
    const seasonId = this.selectedSeasonIdSignal();
    if (!seasonId) return teams;
    return teams.filter(t => t.seasonId === seasonId);
  });

  constructor() {
    this.seasonsStore.reload();
  }

  protected onSeasonChange(id: string) {
    this.selectedSeasonIdSignal.set(id);
  }

  protected retry() {
    this.teamsStore.reload();
    this.seasonsStore.reload();
  }
}
