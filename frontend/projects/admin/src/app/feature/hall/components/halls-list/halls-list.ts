import {Component, computed, effect, inject, viewChild} from '@angular/core';
import {HallsStore, LayoutService} from '@shared-api';
import {DialogService, ErrorData, LoadingData, NotificationService, PageTitle} from '@shared-ui';
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
import {EMPTY, switchMap} from 'rxjs';

@Component({
  selector: 'app-halls',
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
    PageTitle
  ],
  templateUrl: './halls-list.html',
  styleUrl: './halls-list.scss',
})
export class HallsList {
  private readonly hallsStore = inject(HallsStore);
  private readonly layoutService = inject(LayoutService);
  private readonly notificationService = inject(NotificationService);
  private readonly dialogService = inject(DialogService);
  hallsSignal = this.hallsStore.halls;
  isLoading = this.hallsStore.isLoading;
  error = computed(() => !!this.hallsStore.error());



  displayedColumns = computed(() => this.layoutService.isDesktop() ? ['name', 'addressStreet','addressCity','addressPostalCode','addressCountry','actions'] : ['name','actions']);


  // 2. Initialisation de la DataSource
  dataSource = new MatTableDataSource([] as Hall[]);

  // 3. Récupération du Paginator et du Sort (syntaxe viewChild de Signal - Angular 17.3+)
  paginator = viewChild(MatPaginator);
  sort = viewChild(MatSort);

  constructor() {
    // 4. L'effet magique : il s'exécute dès que 'users' change
    effect(() => {
      this.dataSource.data = this.hallsSignal();
      // On réassigne le paginator et le sort au cas où
      this.dataSource.paginator = this.paginator() ?? null;
      this.dataSource.sort = this.sort() ?? null;
    });

  }

  protected retry(): void {
  this.hallsStore.reload();
}

  protected delete(id:string) {
    this.dialogService.showConfirmation("Etes vous sur de vouloir supprimer cette salle?").pipe(
      switchMap(confirmed => confirmed ? this.hallsStore.deleteById(id) : EMPTY),
    ).subscribe({
      next: () => this.notificationService.show("Salle supprimée avec succès",'success')
    })

  }
}
