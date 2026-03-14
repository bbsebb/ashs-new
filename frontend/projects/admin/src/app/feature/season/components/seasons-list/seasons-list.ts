import {Component, computed, effect, inject, viewChild} from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {LayoutService, SeasonsStore} from '@shared-api';
import {ErrorData, LoadingData, NotificationService, PageTitle} from '@shared-ui';
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
  imports: [MatFormFieldModule, MatSortHeader, MatInputModule, MatDatepickerModule, LoadingData, ErrorData, PageTitle, MatFabButton, RouterLink, MatIcon, MatTable, MatSort, MatColumnDef, MatHeaderCell, MatCell, MatHeaderCellDef, MatCellDef, MatIconButton, MatHeaderRow, MatRow, MatHeaderRowDef, MatRowDef, MatNoDataRow, MatPaginator, DatePipe, FormDeleteButton],
  templateUrl: './seasons-list.html',
  styleUrl: './seasons-list.scss',
})
export class SeasonsList {
  private readonly seasonsStore = inject(SeasonsStore);
  private readonly layoutService = inject(LayoutService);
  private readonly notificationService = inject(NotificationService);
  seasonsSignal = this.seasonsStore.seasonsSignal;
  isLoading = this.seasonsStore.isLoadingSignal;
  error = computed(() => !!this.seasonsStore.errorSignal());



  displayedColumns = computed(() => this.layoutService.isDesktopSignal() ? ['name', 'startDate','endDate','isCurrent','isActive','actions'] : ['name','actions']);


  // 2. Initialisation de la DataSource
  dataSource = new MatTableDataSource([] as Season[]);

  // 3. Récupération du Paginator et du Sort (syntaxe viewChild de Signal - Angular 17.3+)
  paginator = viewChild(MatPaginator);
  sort = viewChild(MatSort);

  constructor() {
    // 4. L'effet magique : il s'exécute dès que 'users' change
    effect(() => {
      this.dataSource.data = this.seasonsSignal();
      // On réassigne le paginator et le sort au cas où
      this.dataSource.paginator = this.paginator() ?? null;
      this.dataSource.sort = this.sort() ?? null;
    });

  }

  protected retry(): void {
    this.seasonsStore.reload();
  }

  protected onDelete(id: string) {
    this.seasonsStore.deleteById(id).subscribe({
      next: () => this.notificationService.show("Saison supprimée avec succès", 'success')
    });
  }
}
