import { Component, computed, effect, inject, signal } from '@angular/core';
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
  selectedSeasonId = signal<string | null>(null);

  isLoading = computed(() => this.teamsStore.isLoadingSignal() || this.seasonsStore.isLoadingSignal());
  error = computed(() => this.teamsStore.errorSignal() || this.seasonsStore.errorSignal());

  filteredTeams = computed(() => {
    const teams = this.teamsStore.teamsSignal();
    const seasonId = this.selectedSeasonId();
    if (!seasonId) return teams;
    return teams.filter(t => t.seasonId === seasonId);
  });

  constructor() {
    effect(() => {
      const seasons = this.seasonsSignal();
      if (seasons.length > 0 && !this.selectedSeasonId()) {
        const current = seasons.find(s => s.isCurrent) || seasons[0];
        this.selectedSeasonId.set(current.id);
      }
    });
    this.seasonsStore.reload();
  }

  protected onSeasonChange(id: string) {
    this.selectedSeasonId.set(id);
  }

  protected retry() {
    this.teamsStore.reload();
    this.seasonsStore.reload();
  }
}
