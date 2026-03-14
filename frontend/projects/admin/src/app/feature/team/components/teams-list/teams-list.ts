import {Component, computed, effect, inject, viewChild} from '@angular/core';
import {LayoutService, TeamsStore} from '@shared-api';
import {ErrorData, LoadingData, NotificationService, PageTitle} from '@shared-ui';
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

@Component({
  selector: 'app-teams-list',
  imports: [
    LoadingData,
    ErrorData,
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
    PageTitle,
    FormDeleteButton
  ],
  templateUrl: './teams-list.html',
  styleUrl: './teams-list.scss',
})
export class TeamsList {
  private readonly _teamsStore = inject(TeamsStore);
  private readonly _layoutService = inject(LayoutService);
  private readonly _notificationService = inject(NotificationService);

  teamsSignal = this._teamsStore.teamsSignal;
  isLoading = this._teamsStore.isLoadingSignal;
  error = computed(() => !!this._teamsStore.errorSignal());

  displayedColumns = computed(() => this._layoutService.isDesktopSignal() ? ['category', 'gender', 'teamNumber', 'actions'] : ['category', 'gender', 'actions']);

  dataSource = new MatTableDataSource([] as Team[]);

  paginator = viewChild(MatPaginator);
  sort = viewChild(MatSort);

  constructor() {
    effect(() => {
      this.dataSource.data = this.teamsSignal();
      this.dataSource.paginator = this.paginator() ?? null;
      this.dataSource.sort = this.sort() ?? null;
    });
  }

  protected retry(): void {
    this._teamsStore.reload();
  }

  protected onDelete(id: string) {
    this._teamsStore.deleteById(id).subscribe({
      next: () => this._notificationService.show("Équipe supprimée avec succès", 'success')
    });
  }
}
