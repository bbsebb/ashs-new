/**
 * Component for listing all staff members in the public app.
 */
import {Component, computed, effect, inject, signal} from '@angular/core';
import {SeasonsStore, StaffsStore, TeamsStore} from '@shared-api';
import {ErrorData, LoadingData, PublicPageContainer, RoleStaffPipe, StaffCard, StaffMiniCard} from '@shared-ui';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatCardActions} from '@angular/material/card';
import {FormsModule} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {MatButtonToggleModule} from '@angular/material/button-toggle';

@Component({
  selector: 'app-staffs-list',
  standalone: true,
  providers: [RoleStaffPipe],
  imports: [
    LoadingData,
    ErrorData,
    PublicPageContainer,
    StaffCard,
    StaffMiniCard,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatCardActions,
    FormsModule,
    RouterLink,
    MatButtonToggleModule
  ],
  templateUrl: './staffs-list.html',
  styleUrl: './staffs-list.scss'
})
export class StaffsList {
  private readonly staffsStore = inject(StaffsStore);
  private readonly seasonsStore = inject(SeasonsStore);
  private readonly teamsStore = inject(TeamsStore);
  private readonly roleStaffPipe = inject(RoleStaffPipe);

  viewModeSignal = signal<'cards' | 'mini'>('cards');
  seasonsSignal = this.seasonsStore.seasonsSignal;
  selectedSeasonIdSignal = signal<string | undefined>(undefined);

  isLoadingSignal = computed(() => this.staffsStore.isLoadingSignal() || this.seasonsStore.isLoadingSignal() || this.teamsStore.isLoadingSignal());
  errorSignal = computed(() => this.staffsStore.errorSignal() || this.seasonsStore.errorSignal() || this.teamsStore.errorSignal());

  // Calcul des staffs filtrés avec leurs rôles consolidés et traduits pour la saison
  staffsWithRolesSignal = computed(() => {
    const staffs = this.staffsStore.staffsSignal();
    const teams = this.teamsStore.teamsSignal();
    const selectedSeasonId = this.selectedSeasonIdSignal();

    if (!selectedSeasonId) return [];

    const teamsOfSeason = teams.filter(t => t.seasonId === selectedSeasonId);

    return staffs
      .map(staff => {
        const staffTeams = teamsOfSeason.filter(t => t.staffs.some(s => s.staffId === staff.id));
        if (staffTeams.length === 0) return null;

        // On récupère les rôles uniques, on les traduit, puis on les joint
        const roles = [...new Set(staffTeams.flatMap(t =>
          t.staffs.filter(s => s.staffId === staff.id).map(s => s.role)
        ))];

        const translatedRoles = roles.map(role => this.roleStaffPipe.transform(role));

        return {
          staff,
          rolesSummary: translatedRoles.join(', ')
        };
      })
      .filter((item): item is { staff: any, rolesSummary: string } => item !== null);
  });

  constructor() {
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

  protected toggleView(mode: 'cards' | 'mini') {
    this.viewModeSignal.set(mode);
  }

  protected retry() {
    this.staffsStore.reload();
    this.seasonsStore.reload();
    this.teamsStore.reload();
  }
}
