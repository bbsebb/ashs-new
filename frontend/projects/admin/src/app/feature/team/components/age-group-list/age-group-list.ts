import {Component, effect, inject, signal, viewChild} from '@angular/core';
import {AgeGroupStore} from '@shared-api';
import {ErrorData, LoadingData, NotificationService, PageTitle} from '@shared-ui';
import {MatIcon} from '@angular/material/icon';
import {MatFabButton} from '@angular/material/button';
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
import {RouterLink} from '@angular/router';
import {FormDeleteButton} from '../../../../shared/form-delete-button/form-delete-button';
import {MatPaginator} from '@angular/material/paginator';
import {AgeGroup} from '@shared-domain';

@Component({
  selector: 'app-age-group-list',
  imports: [
    LoadingData,
    ErrorData,
    PageTitle,
    MatIcon,
    MatFabButton,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatCellDef,
    MatCell,
    MatSort,
    RouterLink,
    MatSortHeader,
    FormDeleteButton,
    MatHeaderRow,
    MatRow,
    MatNoDataRow,
    MatRowDef,
    MatHeaderRowDef,
    MatPaginator
  ],
  templateUrl: './age-group-list.html',
  styleUrl: './age-group-list.scss',
})
export class AgeGroupList {
  private readonly _ageGroupStore = inject(AgeGroupStore);
  private readonly _notificationService = inject(NotificationService);
  ageGroupsSignal = this._ageGroupStore.ageGroupsSignal;
  isLoadingSignal = this._ageGroupStore.isLoadingSignal;
  errorSignal = this._ageGroupStore.errorSignal;
  displayedColumns = signal(['name', 'actions']);
  dataSource = new MatTableDataSource([] as AgeGroup[]);

  paginator = viewChild(MatPaginator);
  sort = viewChild(MatSort);

  constructor() {
    effect(() => {
      this.dataSource.data = this.ageGroupsSignal();
      this.dataSource.paginator = this.paginator() ?? null;
      this.dataSource.sort = this.sort() ?? null;
    });
  }

  protected reload() {
    this._ageGroupStore.reload();
  }

  protected onDelete(id: string) {
    this._ageGroupStore.deleteById(id).subscribe({
      next: () => this._notificationService.show("Catégorie supprimée avec succès", 'success')
    });
  }
}
