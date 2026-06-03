import {Component, computed, effect, inject, input} from '@angular/core';
import {CampaignStore, MembershipStore, SeasonsStore} from '@shared-api';
import {AdminPageContainer, DialogService, ErrorData, LoadingData, NotificationService} from '@shared-ui';
import {Router, RouterLink} from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {FormDeleteButton} from '../../../../shared/form-delete-button/form-delete-button';
import {CampaignStatus, UUID} from '@shared-domain';
import {take} from 'rxjs';
import {CurrencyPipe} from '@angular/common';
import {PaymentTransactionsList} from '../payment-transactions-list/payment-transactions-list';

@Component({
  selector: 'app-campaign-view',
  imports: [
    LoadingData,
    ErrorData,
    AdminPageContainer,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    RouterLink,
    FormDeleteButton,
    CurrencyPipe,
    PaymentTransactionsList
  ],
  templateUrl: './campaign-view.html',
  styleUrl: './campaign-view.scss',
})
export class CampaignView {
  private readonly _campaignStore = inject(CampaignStore);
  private readonly _seasonsStore = inject(SeasonsStore);
  private readonly _membershipStore = inject(MembershipStore);
  private readonly _dialogService = inject(DialogService);
  private readonly _notificationService = inject(NotificationService);
  private readonly _router = inject(Router);

  /** The campaign ID from the route. */
  readonly idInputSignal = input.required<string>({alias: 'id'});

  /** The campaign data. */
  readonly campaignSignal = this._campaignStore.campaignById(this.idInputSignal);
  readonly isLoadingSignal = this._campaignStore.isLoadingSignal;
  readonly errorSignal = computed(() => !!this._campaignStore.errorSignal());

  /** The payments list ViewModel. */
  readonly paymentsViewModelSignal = this._membershipStore.campaignPaymentsViewModelSignal;

  /** Resolved season name. */
  readonly seasonNameSignal = computed(() => {
    const campaign = this.campaignSignal();
    if (!campaign) return undefined;
    const season = this._seasonsStore.seasonsSignal().find(season => season.id === campaign.seasonId);
    return season?.name ?? 'Saison inconnue';
  });

  /** Calculated Campaign Statistics */
  readonly statsSignal = computed(() => {
    const viewModel = this.paymentsViewModelSignal();
    const payments = viewModel?.payments ?? [];

    let paidCount = 0;
    let paidAmount = 0;
    let processedCount = 0;
    let processedAmount = 0;
    let errorCount = 0;
    let errorAmount = 0;

    const categoryStats: Record<string, { paid: number; processed: number; total: number }> = {};

    for (const payment of payments) {
      if (payment.status === 'FAILED') {
        errorCount++;
        errorAmount += payment.amount;
      }

      for (const membership of payment.memberships ?? []) {
        if (membership.status === 'PAID') {
          paidCount++;
          paidAmount += membership.amount;
        } else if (membership.status === 'PROCESSED') {
          processedCount++;
          processedAmount += membership.amount;
        }

        if (membership.status === 'PAID' || membership.status === 'PROCESSED') {
          const cat = membership.categoryName || 'Inconnue';
          if (!categoryStats[cat]) {
            categoryStats[cat] = {paid: 0, processed: 0, total: 0};
          }
          if (membership.status === 'PAID') {
            categoryStats[cat].paid++;
          } else {
            categoryStats[cat].processed++;
          }
          categoryStats[cat].total++;
        }
      }
    }

    const categories = Object.entries(categoryStats).map(([name, stats]) => ({
      name,
      paid: stats.paid,
      processed: stats.processed,
      total: stats.total
    })).sort((a, b) => a.name.localeCompare(b.name));

    return {
      joinedAndPaid: {count: paidCount, amount: paidAmount},
      processed: {count: processedCount, amount: processedAmount},
      paymentErrors: {count: errorCount, amount: errorAmount},
      totalValidAmount: paidAmount + processedAmount,
      categories
    };
  });

  constructor() {
    effect(() => {
      // Redirect to 404 if loading is finished, no error, but campaign is still undefined
      if (!this.isLoadingSignal() && !this.errorSignal() && !this.campaignSignal()) {
        void this._router.navigateByUrl('/404');
      }
    });

    effect(() => {
      const id = this.idInputSignal();
      if (id) {
        this._membershipStore.loadAllPayments(id);
      }
    });
  }

  protected retry(): void {
    this._campaignStore.reload();
  }

  /** Deletes the campaign and navigates back to the list. */
  protected onDelete() {
    const id = this.idInputSignal();
    this._campaignStore.deleteById(id).subscribe({
      next: () => {
        this._notificationService.show("Campagne supprimée avec succès", 'success');
        void this._router.navigateByUrl('/membership');
      },
      error: () => this._notificationService.show("Erreur lors de la suppression de la campagne", 'error'),
    });
  }

  /** Launches the campaign. */
  protected onLaunch() {
    const id = this.idInputSignal();
    this._dialogService.showConfirmation("Êtes-vous sûr de vouloir lancer cette campagne ?")
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

  /** Closes the campaign. */
  protected onClose() {
    const id = this.idInputSignal();
    this._dialogService.showConfirmation("Êtes-vous sûr de vouloir fermer cette campagne ?")
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

  /** Processes a membership (marks it as PROCESSED) with a confirmation dialog. */
  protected onProcessMembership(membershipId: UUID) {
    this._dialogService.showConfirmation("Êtes-vous sûr de vouloir marquer cette adhésion comme traitée ?")
      .pipe(take(1))
      .subscribe(confirmed => {
        if (confirmed) {
          this._membershipStore.processMembership(membershipId).subscribe({
            next: () => this._notificationService.show("Adhésion traitée avec succès", 'success'),
            error: () => this._notificationService.show("Erreur lors du traitement de l'adhésion", 'error'),
          });
        }
      });
  }

  protected readonly CampaignStatus = CampaignStatus;
}
