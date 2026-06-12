/**
 * Component for listing all teams in the public app.
 */
import {Component, computed, inject, linkedSignal, signal, ChangeDetectionStrategy} from '@angular/core';
import {SeasonsStore, TeamsStore, ViewModelMapperService} from '@shared-api';
import {ErrorData, GenderPipe, LoadingData, PublicPageContainer, TeamCard, TeamMiniCard} from '@shared-ui';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatOptionModule} from '@angular/material/core';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {GENDER, Gender} from '@shared-domain';

@Component({
  selector: 'app-teams-list',
  standalone: true,
  imports: [
    LoadingData,
    ErrorData,
    PublicPageContainer,
    TeamCard,
    TeamMiniCard,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonToggleModule,
    GenderPipe
  ],
  templateUrl: './teams-list.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './teams-list.scss'
})
export class TeamsList {
  private readonly teamsStore = inject(TeamsStore);
  private readonly seasonsStore = inject(SeasonsStore);
  private readonly _viewModelMapper = inject(ViewModelMapperService);

  viewModeSignal = signal<'cards' | 'mini'>('cards');
  seasonsSignal = this.seasonsStore.seasonsSignal;

  selectedSeasonIdSignal = linkedSignal<string | null>(() => {
    const seasons = this.seasonsSignal();
    if (seasons.length === 0) return null;
    const current = seasons.find(s => s.isCurrent) || seasons[0];
    return current.id;
  });

  selectedGenderSignal = signal<Gender | 'All'>('All');
  genders = Object.values(GENDER);

  isLoadingSignal = computed(() => this.teamsStore.isLoadingSignal() || this.seasonsStore.isLoadingSignal());
  errorSignal = computed(() => this.teamsStore.errorSignal() || this.seasonsStore.errorSignal());

  // Calcul des ViewModels filtrés
  filteredViewModelsSignal = computed(() => {
    const seasonId = this.selectedSeasonIdSignal();
    const gender = this.selectedGenderSignal();

    const teams = this.teamsStore.teamsSignal().filter(t => {
      const matchSeason = !seasonId || t.seasonId === seasonId;
      const matchGender = gender === 'All' || t.gender === gender;
      return matchSeason && matchGender;
    });

    return teams.map(team => ({
      cardVM: this._viewModelMapper.teamCardViewModelById(computed(() => team.id))(),
      miniVM: this._viewModelMapper.teamMiniCardViewModelsSignal().find(vm => vm.id === team.id)
    })).filter(item => item.cardVM && item.miniVM);
  });

  constructor() {
    this.seasonsStore.reload();
  }

  protected onSeasonChange(id: string) {
    this.selectedSeasonIdSignal.set(id);
  }

  protected onGenderChange(gender: Gender | 'All') {
    this.selectedGenderSignal.set(gender);
  }

  protected toggleView(mode: 'cards' | 'mini') {
    this.viewModeSignal.set(mode);
  }

  protected retry() {
    this.teamsStore.reload();
    this.seasonsStore.reload();
  }
}
