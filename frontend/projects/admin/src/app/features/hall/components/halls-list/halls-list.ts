import {Component, computed, effect, inject, viewChild} from '@angular/core';
import {HallsStore, LayoutService} from '@shared-api';
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
import {Hall} from '@shared-domain';
import {FormDeleteButton} from '../../../../shared/form-delete-button/form-delete-button';

@Component({
  selector: 'app-halls',
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
    FormDeleteButton
  ],
  templateUrl: './halls-list.html',
  styleUrl: './halls-list.scss',
})
export class HallsList {
  /** Store for hall data management. */
  private readonly _hallsStore = inject(HallsStore);
  /** Service for layout information. */
  private readonly _layoutService = inject(LayoutService);
  /** Service for user notifications. */
  private readonly _notificationService = inject(NotificationService);

  /** Signal providing the list of halls. */
  hallsSignal = this._hallsStore.hallsSignal;
  /** Signal indicating if halls are loading. */
  isLoadingSignal = this._hallsStore.isLoadingSignal;
  /** Computed signal determining if an error occurred. */
  errorSignal = computed(() => !!this._hallsStore.errorSignal());

  /** Computed signal for table columns to display based on screen size. */
  displayedColumnsSignal = computed(() => this._layoutService.isDesktopSignal() ? ['name', 'addressStreet', 'addressCity', 'addressPostalCode', 'addressCountry', 'actions'] : ['name', 'actions']);

  /** The table data source. */
  dataSource = new MatTableDataSource([] as Hall[]);

  /** Signal for the table paginator component. */
  paginatorSignal = viewChild(MatPaginator);
  /** Signal for the table sort component. */
  sortSignal = viewChild(MatSort);

  constructor() {
    /** Effect to synchronize the data source with the halls list and table features. */
    effect(() => {
      this.dataSource.data = this.hallsSignal();
      this.dataSource.paginator = this.paginatorSignal() ?? null;
      this.dataSource.sort = this.sortSignal() ?? null;
    });

  }

  /** Retries fetching the halls list. */
  protected retry(): void {
    this._hallsStore.reload();
}

  /**
   * Deletes a hall by its ID.
   * @param id The ID of the hall to delete.
   */
  protected onDelete(id: string) {
    this._hallsStore.deleteById(id).subscribe({
      next: () => this._notificationService.show("Salle supprimée avec succès", 'success')
    });
  }
}
