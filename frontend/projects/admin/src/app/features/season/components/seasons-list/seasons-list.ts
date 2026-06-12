/**
 * Component for listing all sport seasons with sorting and pagination.
 */
import {Component, computed, effect, inject, viewChild, ChangeDetectionStrategy} from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {LayoutService, SeasonsStore} from '@shared-api';
import {AdminPageContainer, ErrorData, LoadingData, NotificationService} from '@shared-ui';
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
import {Season} from '@shared-domain';
import {DatePipe} from '@angular/common';
import {FormDeleteButton} from '../../../../shared/form-delete-button/form-delete-button';


@Component({
  selector: 'app-seasons-list',
  imports: [MatFormFieldModule, MatSortHeader, MatInputModule, MatDatepickerModule, LoadingData, ErrorData, AdminPageContainer, MatFabButton, RouterLink, MatIcon, MatTable, MatSort, MatColumnDef, MatHeaderCell, MatCell, MatHeaderCellDef, MatCellDef, MatIconButton, MatHeaderRow, MatRow, MatHeaderRowDef, MatRowDef, MatNoDataRow, MatPaginator, DatePipe, FormDeleteButton],
  templateUrl: './seasons-list.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './seasons-list.scss',
})
export class SeasonsList {
  private readonly _seasonsStore = inject(SeasonsStore);
  private readonly _layoutService = inject(LayoutService);
  private readonly _notificationService = inject(NotificationService);

  readonly seasonsSignal = this._seasonsStore.seasonsSignal;
  readonly isLoadingSignal = this._seasonsStore.isLoadingSignal;
  readonly errorSignalSignal = computed(() => !!this._seasonsStore.errorSignal());

  readonly displayedColumnsSignal = computed(() => this._layoutService.isDesktopSignal() ? ['name', 'startDate', 'endDate', 'isCurrent', 'isActive', 'actions'] : ['name', 'actions']);

  /** The data source for the Material table. */
  dataSource = new MatTableDataSource([] as Season[]);

  /** Signal-based references to Material components. */
  paginatorSignal = viewChild(MatPaginator);
  sortSignal = viewChild(MatSort);

  constructor() {
    /** Sync signal data with table source. */
    effect(() => {
      this.dataSource.data = this.seasonsSignal();
      this.dataSource.paginator = this.paginatorSignal() ?? null;
      this.dataSource.sort = this.sortSignal() ?? null;
    });
  }

  /** Reloads seasons from the API. */
  protected retry(): void {
    this._seasonsStore.reload();
  }

  /** Deletes a season by ID. */
  protected onDelete(id: string) {
    this._seasonsStore.deleteById(id).subscribe({
      next: () => this._notificationService.show("Saison supprimée avec succès", 'success'),
      //TODO : Handle error notification
      error: (_) => this._notificationService.show("Erreur lors de la suppression de la saison", 'error'),
    });
  }
}
