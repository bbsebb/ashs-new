import {Component, computed, inject, linkedSignal, signal} from '@angular/core';
import {SeasonsStore, TeamsStore} from '@shared-api';
import {ErrorData, GenderPipe, LoadingData, PublicPageContainer, TeamCard, TeamMiniCard} from '@shared-ui';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatOptionModule} from '@angular/material/core';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {GENDER, Gender} from '@shared-domain';

@Component({
  selector: 'app-teams-list',
  standalone: true,
  imports: [
    LoadingData,
    ErrorData,
    PublicPageContainer,
    TeamCard,
    TeamMiniCard,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonToggleModule,
    GenderPipe
  ],
  templateUrl: './teams-list.html',
  styleUrl: './teams-list.scss'
})
export class TeamsList {
  private readonly teamsStore = inject(TeamsStore);
  private readonly seasonsStore = inject(SeasonsStore);

  viewModeSignal = signal<'cards' | 'mini'>('cards');
  seasonsSignal = this.seasonsStore.seasonsSignal;

  selectedSeasonIdSignal = linkedSignal<string | null>(() => {
    const seasons = this.seasonsSignal();
    if (seasons.length === 0) return null;
    const current = seasons.find(s => s.isCurrent) || seasons[0];
    return current.id;
  });

  selectedGenderSignal = signal<Gender | 'All'>('All');
  genders = Object.values(GENDER);

  isLoadingSignal = computed(() => this.teamsStore.isLoadingSignal() || this.seasonsStore.isLoadingSignal());
  errorSignal = computed(() => this.teamsStore.errorSignal() || this.seasonsStore.errorSignal());

  filteredTeamsSignal = computed(() => {
    const teams = this.teamsStore.teamsSignal();
    const seasonId = this.selectedSeasonIdSignal();
    const gender = this.selectedGenderSignal();

    let result = teams;

    if (seasonId) {
      result = result.filter(t => t.seasonId === seasonId);
    }

    if (gender !== 'All') {
      result = result.filter(t => t.gender === gender);
    }

    // Tri alphabétique par nom de catégorie pour un meilleur rendu en liste
    return [...result].sort((a, b) => a.ageGroup.name.localeCompare(b.ageGroup.name));
  });

  constructor() {
    this.seasonsStore.reload();
  }

  protected onSeasonChange(id: string) {
    this.selectedSeasonIdSignal.set(id);
  }

  protected onGenderChange(gender: Gender | 'All') {
    this.selectedGenderSignal.set(gender);
  }

  protected toggleView(mode: 'cards' | 'mini') {
    this.viewModeSignal.set(mode);
  }

  protected retry() {
    this.teamsStore.reload();
    this.seasonsStore.reload();
  }
}
