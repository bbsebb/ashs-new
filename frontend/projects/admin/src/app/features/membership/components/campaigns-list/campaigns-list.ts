import {Component, computed, effect, inject, viewChild, ChangeDetectionStrategy} from '@angular/core';
import {CampaignStore, SeasonsStore} from '@shared-api';
import {AdminPageContainer, DialogService, ErrorData, LoadingData, NotificationService} from '@shared-ui';
import {MatFabButton, MatIconButton} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
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
import {Campaign, CampaignStatus} from '@shared-domain';
import {FormDeleteButton} from '../../../../shared/form-delete-button/form-delete-button';
import {take} from 'rxjs';

@Component({
  selector: 'app-campaigns-list',
  imports: [
    LoadingData,
    ErrorData,
    AdminPageContainer,
    MatFabButton,
    RouterLink,
    MatIcon,
    MatTable,
    MatSort,
    MatSortHeader,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatHeaderCellDef,
    MatCellDef,
    MatIconButton,
    MatHeaderRow,
    MatRow,
    MatHeaderRowDef,
    MatRowDef,
    MatNoDataRow,
    MatPaginator,
    FormDeleteButton
  ],
  templateUrl: './campaigns-list.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './campaigns-list.scss',
})
export class CampaignsList {
  private readonly _campaignStore = inject(CampaignStore);
  private readonly _seasonsStore = inject(SeasonsStore);
  private readonly _dialogService = inject(DialogService);
  private readonly _notificationService = inject(NotificationService);

  readonly campaignsSignal = this._campaignStore.campaignsSignal;
  readonly isLoadingSignal = this._campaignStore.isLoadingSignal;
  readonly errorSignal = computed(() => !!this._campaignStore.errorSignal());

  /** Combined signal to include season names in the list. */
  readonly dataSourceSignal = computed(() => {
    const campaigns = this.campaignsSignal();
    const seasons = this._seasonsStore.seasonsSignal();
    return campaigns.map(campaign => ({
      ...campaign,
      seasonName: seasons.find(s => s.id === campaign.seasonId)?.name ?? 'Chargement...'
    }));
  });

  readonly displayedColumns = ['seasonName', 'status', 'actions'];

  /** The data source for the Material table. */
  dataSource = new MatTableDataSource([] as any[]);

  /** Signal-based references to Material components. */
  paginatorSignal = viewChild(MatPaginator);
  sortSignal = viewChild(MatSort);

  constructor() {
    /** Sync signal data with table source. */
    effect(() => {
      this.dataSource.data = this.dataSourceSignal();
      this.dataSource.paginator = this.paginatorSignal() ?? null;
      this.dataSource.sort = this.sortSignal() ?? null;
    });
  }

  /** Reloads campaigns from the API. */
  protected retry(): void {
    this._campaignStore.reload();
  }

  /** Deletes a campaign by ID. */
  protected onDelete(id: string) {
    this._campaignStore.deleteById(id).subscribe({
      next: () => this._notificationService.show("Campagne supprimée avec succès", 'success'),
      error: () => this._notificationService.show("Erreur lors de la suppression de la campagne", 'error'),
    });
  }

  /** Launches a campaign after confirmation. */
  protected onLaunch(id: string) {
    this._dialogService.showConfirmation("Êtes-vous sûr de vouloir lancer cette campagne ? Une fois lancée, elle sera ouverte aux adhésions.")
      .pipe(take(1))
      .subscribe(confirmed => {
        if (confirmed) {
          this._campaignStore.launchCampaign(id).subscribe({
            next: () => this._notificationService.show("Campagne lancée avec succès", 'success'),
            error: () => this._notificationService.show("Erreur lors du lancement de la campagne", 'error'),
          });
        }
      });
  }

  /** Closes a campaign after confirmation. */
  protected onClose(id: string) {
    this._dialogService.showConfirmation("Êtes-vous sûr de vouloir fermer cette campagne ? Plus aucune adhésion ne sera possible.")
      .pipe(take(1))
      .subscribe(confirmed => {
        if (confirmed) {
          this._campaignStore.closeCampaign(id).subscribe({
            next: () => this._notificationService.show("Campagne fermée avec succès", 'success'),
            error: () => this._notificationService.show("Erreur lors de la fermeture de la campagne", 'error'),
          });
        }
      });
  }

  protected readonly CampaignStatus = CampaignStatus;
}
