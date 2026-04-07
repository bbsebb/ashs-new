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
  private readonly staffsStore = inject(StaffsStore);
  private readonly layoutService = inject(LayoutService);
  private readonly notificationService = inject(NotificationService);
  staffsSignal = this.staffsStore.staffsSignal;
  isLoadingSignal = this.staffsStore.isLoadingSignal;
  errorSignal = computed(() => !!this.staffsStore.errorSignal());


  displayedColumns = computed(() => this.layoutService.isDesktopSignal() ? ['firstName', 'lastName', 'email', 'phone', 'actions'] : ['firstName', 'lastName', 'actions']);


  // 2. Initialisation de la DataSource
  dataSource = new MatTableDataSource([] as Staff[]);

  // 3. Récupération du Paginator et du Sort (syntaxe viewChild de Signal - Angular 17.3+)
  paginator = viewChild(MatPaginator);
  sort = viewChild(MatSort);

  constructor() {
    // 4. L'effet magique : il s'exécute dès que 'staffs' change
    effect(() => {
      this.dataSource.data = this.staffsSignal();
      // On réassigne le paginator et le sort au cas où
      this.dataSource.paginator = this.paginator() ?? null;
      this.dataSource.sort = this.sort() ?? null;
    });

  }

  protected retry(): void {
    this.staffsStore.reload();
  }

  protected onDelete(id: string) {
    this.staffsStore.deleteById(id).subscribe({
      next: () => this.notificationService.show("Membre de l'encadrement supprimé avec succès", 'success')
    });
  }
}
