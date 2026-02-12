import {Component, computed, effect, inject, viewChild} from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {LayoutService, SeasonsStore} from '@shared-api';
import {DialogService, ErrorData, LoadingData, NotificationService, PageTitle} from '@shared-ui';
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
import {EMPTY, switchMap} from 'rxjs';
import {DatePipe} from '@angular/common';


@Component({
  selector: 'app-seasons-list',
  imports: [MatFormFieldModule, MatSortHeader, MatInputModule, MatDatepickerModule, LoadingData, ErrorData, PageTitle, MatFabButton, RouterLink, MatIcon, MatTable, MatSort, MatColumnDef, MatHeaderCell, MatCell, MatHeaderCellDef, MatCellDef, MatIconButton, MatHeaderRow, MatRow, MatHeaderRowDef, MatRowDef, MatNoDataRow, MatPaginator, DatePipe],
  templateUrl: './seasons-list.html',
  styleUrl: './seasons-list.scss',
})
export class SeasonsList {
  private readonly seasonsStore = inject(SeasonsStore);
  private readonly layoutService = inject(LayoutService);
  private readonly notificationService = inject(NotificationService);
  private readonly dialogService = inject(DialogService);
  seasonsSignal = this.seasonsStore.seasons;
  isLoading = this.seasonsStore.isLoading;
  error = computed(() => !!this.seasonsStore.error());



  displayedColumns = computed(() => this.layoutService.isDesktop() ? ['name', 'startDate','endDate','isCurrent','isActive','actions'] : ['name','actions']);


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

  protected delete(id:string) {
    this.dialogService.showConfirmation("Etes vous sur de vouloir supprimer cette saison?").pipe(
      switchMap(confirmed => confirmed ? this.seasonsStore.deleteById(id) : EMPTY),
    ).subscribe({
      next: () => this.notificationService.show("Season supprimée avec succès",'success')
    })

  }
}
