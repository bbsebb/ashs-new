import {Component, computed, effect, inject, input} from '@angular/core';
import {CampaignStore, SeasonsStore} from '@shared-api';
import {AdminPageContainer, DialogService, ErrorData, LoadingData, NotificationService} from '@shared-ui';
import {Router, RouterLink} from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {FormDeleteButton} from '../../../../shared/form-delete-button/form-delete-button';
import {CampaignStatus} from '@shared-domain';
import {take} from 'rxjs';
import {CurrencyPipe} from '@angular/common';

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
    CurrencyPipe
  ],
  templateUrl: './campaign-view.html',
  styleUrl: './campaign-view.scss',
})
export class CampaignView {
  private readonly _campaignStore = inject(CampaignStore);
  private readonly _seasonsStore = inject(SeasonsStore);
  private readonly _dialogService = inject(DialogService);
  private readonly _notificationService = inject(NotificationService);
  private readonly _router = inject(Router);

  /** The campaign ID from the route. */
  readonly idInputSignal = input.required<string>({alias: 'id'});

  /** The campaign data. */
  readonly campaignSignal = this._campaignStore.campaignById(this.idInputSignal);
  readonly isLoadingSignal = this._campaignStore.isLoadingSignal;
  readonly errorSignal = computed(() => !!this._campaignStore.errorSignal());

  /** Resolved season name. */
  readonly seasonNameSignal = computed(() => {
    const campaign = this.campaignSignal();
    if (!campaign) return undefined;
    const season = this._seasonsStore.seasonsSignal().find(s => s.id === campaign.seasonId);
    return season?.name ?? 'Saison inconnue';
  });

  /** Fictional Statistics Signals (as requested) */
  readonly statsSignal = computed(() => {
    // These are placeholders for the UI design.
    // They will be replaced by actual backend data later.
    return {
      joinedAndPaid: {count: 145, amount: 25400},
      processed: {count: 130, amount: 22800},
      paymentErrors: {count: 15, amount: 2600},
      totalValidAmount: 25400 + 22800 // Sum of previous two categories as requested
    };
  });

  constructor() {
    effect(() => {
      // Redirect to 404 if loading is finished, no error, but campaign is still undefined
      if (!this.isLoadingSignal() && !this.errorSignal() && !this.campaignSignal()) {
        void this._router.navigateByUrl('/404');
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

  protected readonly CampaignStatus = CampaignStatus;
}
