import {Component, computed, inject, input, linkedSignal, Signal} from '@angular/core';
import {FieldTree, form, FormField, max, min, required, submit} from '@angular/forms/signals';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {firstValueFrom, tap} from 'rxjs';
import {CreateTeamDTO, FormErrorHandleService, TeamsStore} from '@shared-api'
import {FormFieldErrorDirective, FormSubmitButton, NotificationService, PageTitle} from '@shared-ui';
import {Gender, Team} from '@shared-domain';
import {Router, RouterLink} from '@angular/router';
import {TeamCard} from '../team-card/team-card';
import {SelectedSeason} from '../../../../shared/services/selected-season';

@Component({
  selector: 'app-team-form',
  imports: [
    FormField,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormSubmitButton,
    RouterLink,
    PageTitle,
    FormFieldErrorDirective,
    TeamCard
  ],
  templateUrl: './team-form.html',
  styleUrl: './team-form.scss',
})
export class TeamForm {
  private readonly _formErrorHandler = inject(FormErrorHandleService);
  private readonly _teamsStore = inject(TeamsStore);
  private readonly _selectedSeasonService = inject(SelectedSeason);
  private readonly _router = inject(Router);
  private readonly _notificationService = inject(NotificationService);

  isLoading = this._teamsStore.isLoadingSignal;
  error = computed(() => !!this._teamsStore.errorSignal());
  id = input<string | undefined>(undefined);
  teamSignal: Signal<Team | undefined> = this._teamsStore.teamById(this.id);
  isCreateForm = computed(() => !this.id());

  ageGroupsSignal = this._teamsStore.ageGroupsSignal;
  genders = Object.values(Gender);

  // Form model reset automatically when teamSignal changes
  teamFormModelSignal = linkedSignal<TeamFormModel>(() => {
    const team = this.teamSignal();
    return {
      ageGroupId: team?.ageGroup.id ?? '',
      gender: team?.gender ?? Gender.Male,
      teamNumber: team?.teamNumber ?? 1,
    };
  });

  teamForm = this.buildForm();

  teamPreview = computed(() => {
    const model = this.teamFormModelSignal();
    const ageGroup = this.ageGroupsSignal().find(ag => ag.id === model.ageGroupId) ?? {
      uuid: '',
      ageLimit: 0,
      isUpperLimit: false
    };

    return {
      id: this.id() ?? '',
      seasonId: this._selectedSeasonService.selectedSeasonSignal()?.id ?? '',
      gender: model.gender,
      teamNumber: model.teamNumber,
      ageGroup: ageGroup
    } as Team;
  });

  private buildForm(): FieldTree<TeamFormModel> {
    return form(this.teamFormModelSignal, (path) => {
      required(path.ageGroupId, {message: 'La catégorie est requise.'});
      required(path.gender, {message: 'Le genre est requis.'});
      required(path.teamNumber, {message: "Le numéro d'équipe est requis."});
      min(path.teamNumber, 1, {message: "Le numéro d'équipe doit être au moins 1."});
      max(path.teamNumber, 9, {message: "Le numéro d'équipe ne doit pas dépasser 9."});
    });
  }

  protected submitForm(event: Event) {
    event.preventDefault();
    const id = this.id();
    const seasonId = this._selectedSeasonService.selectedSeasonSignal()?.id;

    if (!seasonId) {
      this._notificationService.show('Veuillez sélectionner une saison dans le menu.', 'error');
      return;
    }

    void submit(this.teamForm, async (form) => {
      try {
        const teamDTO: CreateTeamDTO = {
          ...this.teamFormModelSignal(),
          seasonId: seasonId
        };

        let resultId: string | undefined;
        if (!id) {
          const newTeam = await firstValueFrom(this._teamsStore.createTeam(teamDTO).pipe(
            tap(() => this._notificationService.show("L'équipe a été enregistrée", 'success'))
          ));
          resultId = newTeam.id;
        } else {
          const updatedTeam = await firstValueFrom(this._teamsStore.updateTeam(id, teamDTO).pipe(
            tap(() => this._notificationService.show("L'équipe a été mise à jour", 'success'))
          ));
          resultId = updatedTeam.id;
        }
        await this._router.navigateByUrl(`/teams/${resultId}`);
        return undefined;
      } catch (error) {
        return this._formErrorHandler.handleError(error, form);
      }
    });
  }
}

interface TeamFormModel {
  ageGroupId: string;
  gender: Gender;
  teamNumber: number;
}
