/**
 * Component for listing all staff members.
 */
import {Component, computed, effect, inject, viewChild} from '@angular/core';
import {LayoutService, StaffsStore} from '@shared-api';
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
import {Staff} from '@shared-domain';
import {FormDeleteButton} from '../../../../shared/form-delete-button/form-delete-button';

@Component({
  selector: 'app-staffs-list',
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
  templateUrl: './staffs-list.html',
  styleUrl: './staffs-list.scss',
})
export class StaffsList {
  private readonly _staffsStore = inject(StaffsStore);
  private readonly _layoutService = inject(LayoutService);
  private readonly _notificationService = inject(NotificationService);

  readonly staffsSignal = this._staffsStore.staffsSignal;
  readonly isLoadingSignal = this._staffsStore.isLoadingSignal;
  readonly errorSignalSignal = computed(() => !!this._staffsStore.errorSignal());

  readonly displayedColumnsSignal = computed(() => this._layoutService.isDesktopSignal() ? ['firstName', 'lastName', 'email', 'phone', 'actions'] : ['firstName', 'lastName', 'actions']);

  /** The data source used by the material table. */
  dataSource = new MatTableDataSource([] as Staff[]);

  /** Signal-based references to paginator and sort components. */
  paginatorSignal = viewChild(MatPaginator);
  sortSignal = viewChild(MatSort);

  constructor() {
    /**
     * Automatically update table data and connectors when store or view childs change.
     */
    effect(() => {
      this.dataSource.data = this.staffsSignal();
      this.dataSource.paginator = this.paginatorSignal() ?? null;
      this.dataSource.sort = this.sortSignal() ?? null;
    });
  }

  /** Reloads the staff list from the backend. */
  protected retry(): void {
    this._staffsStore.reload();
  }

  /**
   * Triggers the deletion of a staff member.
   * @param id The UUID of the staff to delete.
   */
  protected onDelete(id: string) {
    this._staffsStore.deleteById(id).subscribe({
      next: () => this._notificationService.show("Membre de l'encadrement supprimé avec succès", 'success')
    });
  }
}
