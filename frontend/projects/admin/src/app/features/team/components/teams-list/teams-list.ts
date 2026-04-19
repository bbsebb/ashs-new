/**
 * Component for listing and filtering teams by season.
 */
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

  readonly seasonsSignal = this._seasonsStore.seasonsSignal;
  readonly selectedSeasonIdSignal = signal<string | undefined>(undefined);

  readonly isLoadingSignal = computed(() => this._teamsStore.isLoadingSignal() || this._seasonsStore.isLoadingSignal());
  readonly errorSignalSignal = computed(() => !!this._teamsStore.errorSignal() || !!this._seasonsStore.errorSignal());

  /** Teams filtered by the selected season. */
  readonly filteredTeamsSignal = computed(() => {
    const teams = this._teamsStore.teamsSignal();
    const selectedSeasonId = this.selectedSeasonIdSignal();

    if (!selectedSeasonId) return teams;
    return teams.filter(t => t.seasonId === selectedSeasonId);
  });

  readonly displayedColumnsSignal = computed(() => this._layoutService.isDesktopSignal() ? ['category', 'gender', 'teamNumber', 'actions'] : ['category', 'gender', 'actions']);

  /** The data source used by the material table. */
  dataSource = new MatTableDataSource([] as Team[]);

  /** Signal-based references to paginator and sort components. */
  paginatorSignal = viewChild(MatPaginator);
  sortSignal = viewChild(MatSort);

  constructor() {
    /** Initialize default season to current one if available. */
    effect(() => {
      const currentSeason = this._seasonsStore.currentSeasonSignal();
      if (currentSeason && !this.selectedSeasonIdSignal()) {
        this.selectedSeasonIdSignal.set(currentSeason.id);
      }
    });

    /** Sync table data and controls with signals. */
    effect(() => {
      this.dataSource.data = this.filteredTeamsSignal();
      this.dataSource.paginator = this.paginatorSignal() ?? null;
      this.dataSource.sort = this.sortSignal() ?? null;
    });
  }

  /** Changes the filtered season. */
  protected onSeasonChange(seasonId: string) {
    this.selectedSeasonIdSignal.set(seasonId);
  }

  /** Retries loading both teams and seasons. */
  protected retry(): void {
    this._teamsStore.reload();
    this._seasonsStore.reload();
  }

  /** Deletes a team by ID. */
  protected onDelete(id: string) {
    this._teamsStore.deleteById(id).subscribe({
      next: () => this._notificationService.show("Équipe supprimée avec succès", 'success')
    });
  }
}
