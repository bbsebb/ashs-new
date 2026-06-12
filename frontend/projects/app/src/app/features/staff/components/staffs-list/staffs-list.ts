/**
 * Component for listing all staff members in the public app.
 */
import {Component, computed, effect, inject, signal, ChangeDetectionStrategy} from '@angular/core';
import {SeasonsStore, StaffsStore, TeamsStore, ViewModelMapperService} from '@shared-api';
import {ErrorData, LoadingData, PublicPageContainer, StaffCard, StaffMiniCard} from '@shared-ui';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatCardActions} from '@angular/material/card';
import {FormsModule} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {MatButtonToggleModule} from '@angular/material/button-toggle';

@Component({
  selector: 'app-staffs-list',
  standalone: true,
  imports: [
    LoadingData,
    ErrorData,
    PublicPageContainer,
    StaffCard,
    StaffMiniCard,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatCardActions,
    FormsModule,
    RouterLink,
    MatButtonToggleModule
  ],
  templateUrl: './staffs-list.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './staffs-list.scss'
})
export class StaffsList {
  private readonly staffsStore = inject(StaffsStore);
  private readonly seasonsStore = inject(SeasonsStore);
  private readonly teamsStore = inject(TeamsStore);
  private readonly _viewModelMapper = inject(ViewModelMapperService);

  viewModeSignal = signal<'cards' | 'mini'>('cards');
  seasonsSignal = this.seasonsStore.seasonsSignal;
  selectedSeasonIdSignal = signal<string | undefined>(undefined);

  isLoadingSignal = computed(() => this.staffsStore.isLoadingSignal() || this.seasonsStore.isLoadingSignal() || this.teamsStore.isLoadingSignal());
  errorSignal = computed(() => this.staffsStore.errorSignal() || this.seasonsStore.errorSignal() || this.teamsStore.errorSignal());

  // Calcul des staffs filtrés via ViewModelMapper
  staffViewModelsSignal = computed(() => {
    const staffs = this.staffsStore.staffsSignal();
    const selectedSeasonId = this.selectedSeasonIdSignal();

    if (!selectedSeasonId) return [];

    return staffs
      .map(staff => {
        const vm = this._viewModelMapper.staffCardViewModelById(computed(() => staff.id), computed(() => selectedSeasonId))();
        // Si pas d'équipes pour cette saison, on ne l'affiche pas dans la liste publique
        if (!vm || vm.assignedTeams.length === 0) return null;
        
        return {
          viewModel: vm,
          // Summary for mini card
          rolesSummary: vm.assignedTeams.map(t => t.roleLabel).join(', ')
        };
      })
      .filter((item): item is { viewModel: any, rolesSummary: string } => item !== null);
  });

  constructor() {
    effect(() => {
      const currentSeason = this.seasonsStore.currentSeasonSignal();
      if (currentSeason && !this.selectedSeasonIdSignal()) {
        this.selectedSeasonIdSignal.set(currentSeason.id);
      }
    });
  }

  protected onSeasonChange(seasonId: string) {
    this.selectedSeasonIdSignal.set(seasonId);
  }

  protected toggleView(mode: 'cards' | 'mini') {
    this.viewModeSignal.set(mode);
  }

  protected retry() {
    this.staffsStore.reload();
    this.seasonsStore.reload();
    this.teamsStore.reload();
  }
}
