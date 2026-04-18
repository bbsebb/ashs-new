import {Component, computed, effect, inject, signal, viewChild} from '@angular/core';
import {LayoutService, SeasonsStore, TeamsStore} from '@shared-api';
import {AdminPageContainer, ErrorData, LoadingData, NotificationService} from '@shared-ui';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatNoDataRow,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource
} from '@angular/material/table';
import {MatSort, MatSortHeader} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {MatFabButton, MatIconButton} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {Team} from '@shared-domain';
import {FormDeleteButton} from '../../../../shared/form-delete-button/form-delete-button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';

@Component({
  selector: 'app-teams-list',
  imports: [
    LoadingData,
    ErrorData,
    AdminPageContainer,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatHeaderCellDef,
    MatSort,
    MatPaginator,
    MatHeaderRowDef,
    MatCellDef,
    MatHeaderRow,
    MatRow,
    MatRowDef,
    MatSortHeader,
    MatIconButton,
    RouterLink,
    MatIcon,
    MatNoDataRow,
    MatFabButton,
    FormDeleteButton,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './teams-list.html',
  styleUrl: './teams-list.scss',
})
export class TeamsList {
  private readonly _teamsStore = inject(TeamsStore);
  private readonly _seasonsStore = inject(SeasonsStore);
  private readonly _layoutService = inject(LayoutService);
  private readonly _notificationService = inject(NotificationService);

  seasonsSignal = this._seasonsStore.seasonsSignal;
  selectedSeasonIdSignal = signal<string | undefined>(undefined);

  isLoadingSignal = computed(() => this._teamsStore.isLoadingSignal() || this._seasonsStore.isLoadingSignal());
  errorSignal = computed(() => !!this._teamsStore.errorSignal() || !!this._seasonsStore.errorSignal());

  // Données filtrées par saison pour la table
  filteredTeamsSignal = computed(() => {
    const teams = this._teamsStore.teamsSignal();
    const selectedSeasonId = this.selectedSeasonIdSignal();

    if (!selectedSeasonId) return teams;
    return teams.filter(t => t.seasonId === selectedSeasonId);
  });

  displayedColumns = computed(() => this._layoutService.isDesktopSignal() ? ['category', 'gender', 'teamNumber', 'actions'] : ['category', 'gender', 'actions']);

  dataSource = new MatTableDataSource([] as Team[]);

  paginator = viewChild(MatPaginator);
  sort = viewChild(MatSort);

  constructor() {
    // Initialisation saison courante
    effect(() => {
      const currentSeason = this._seasonsStore.currentSeasonSignal();
      if (currentSeason && !this.selectedSeasonIdSignal()) {
        this.selectedSeasonIdSignal.set(currentSeason.id);
      }
    });

    // Mise à jour de la table
    effect(() => {
      this.dataSource.data = this.filteredTeamsSignal();
      this.dataSource.paginator = this.paginator() ?? null;
      this.dataSource.sort = this.sort() ?? null;
    });
  }

  protected onSeasonChange(seasonId: string) {
    this.selectedSeasonIdSignal.set(seasonId);
  }

  protected retry(): void {
    this._teamsStore.reload();
    this._seasonsStore.reload();
  }

  protected onDelete(id: string) {
    this._teamsStore.deleteById(id).subscribe({
      next: () => this._notificationService.show("Équipe supprimée avec succès", 'success')
    });
  }
}
