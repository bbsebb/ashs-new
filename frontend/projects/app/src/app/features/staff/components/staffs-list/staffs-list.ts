import {Component, computed, effect, inject, signal} from '@angular/core';
import {SeasonsStore, StaffsStore, TeamsStore} from '@shared-api';
import {ErrorData, LoadingData, PublicPageContainer, StaffCard} from '@shared-ui';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatCardActions} from '@angular/material/card';
import {FormsModule} from '@angular/forms';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-staffs-list',
  standalone: true,
  imports: [
    LoadingData,
    ErrorData,
    PublicPageContainer,
    StaffCard,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatCardActions,
    FormsModule,
    RouterLink
  ],
  templateUrl: './staffs-list.html',
  styleUrl: './staffs-list.scss'
})
export class StaffsList {
  private readonly staffsStore = inject(StaffsStore);
  private readonly seasonsStore = inject(SeasonsStore);
  private readonly teamsStore = inject(TeamsStore);

  seasonsSignal = this.seasonsStore.seasonsSignal;
  selectedSeasonIdSignal = signal<string | undefined>(undefined);

  isLoadingSignal = computed(() => this.staffsStore.isLoadingSignal() || this.seasonsStore.isLoadingSignal() || this.teamsStore.isLoadingSignal());
  errorSignal = computed(() => this.staffsStore.errorSignal() || this.seasonsStore.errorSignal() || this.teamsStore.errorSignal());

  // Staffs filtrés : n'afficher que ceux qui ont au moins une équipe pour la saison sélectionnée
  filteredStaffsSignal = computed(() => {
    const staffs = this.staffsStore.staffsSignal();
    const teams = this.teamsStore.teamsSignal();
    const selectedSeasonId = this.selectedSeasonIdSignal();

    if (!selectedSeasonId) return [];

    // On filtre les équipes de la saison sélectionnée
    const teamsOfSeason = teams.filter(t => t.seasonId === selectedSeasonId);

    // On récupère les IDs des staffs qui encadrent ces équipes
    const staffIdsOfSeason = new Set(
      teamsOfSeason.flatMap(t => t.staffs.map(s => s.staffId))
    );

    // On retourne les staffs correspondants
    return staffs.filter(s => staffIdsOfSeason.has(s.id));
  });

  constructor() {
    // Initialisation de la saison sélectionnée sur la saison courante dès qu'elle est disponible
    effect(() => {
      const currentSeason = this.seasonsStore.currentSeasonSignal();
      if (currentSeason && !this.selectedSeasonIdSignal()) {
        this.selectedSeasonIdSignal.set(currentSeason.id);
      }
    });
  }

  protected onSeasonChange(seasonId: string) {
    this.selectedSeasonIdSignal.set(seasonId);
  }

  protected retry() {
    this.staffsStore.reload();
    this.seasonsStore.reload();
    this.teamsStore.reload();
  }
}
