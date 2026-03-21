import {computed, inject, Injectable, Signal} from '@angular/core';
import {Observable, tap} from 'rxjs';
import {Team} from '@shared-domain';
import {TeamGateway} from './team.gateway';
import {CreateTeamDTO, UpdateTeamDTO} from './team.dtos';

@Injectable({
  providedIn: 'root',
})
export class TeamsStore {
  private readonly _teamGateway = inject(TeamGateway);
  private readonly _teamsResource = this._teamGateway.getTeams();
  readonly teamsSignal: Signal<Team[]> = computed(() => this._teamsResource.hasValue() ? this._teamsResource.value() : []);


  isLoadingSignal = this._teamsResource.isLoading;
  errorSignal = this._teamsResource.error;


  teamById(idSignal: Signal<string | undefined>): Signal<Team | undefined> {
    return computed(() => {
      const teamId = idSignal();
      if (!teamId) return undefined;

      return this.teamsSignal().find((team) => team.id === teamId);
    });
  }

  createTeam(createTeamDTO: CreateTeamDTO, blobPhoto: Blob | undefined): Observable<Team> {
    return this._teamGateway.createTeam(createTeamDTO, blobPhoto).pipe(
      tap((createdTeam) => this._teamsResource.update(teamsList => [...teamsList, createdTeam]))
    );
  }

  reload(): void {
    this._teamsResource.reload();
  }


  deleteById(teamId: string): Observable<void> {
    return this._teamGateway.deleteById(teamId).pipe(
      tap(() => this._teamsResource.update(teamsList => teamsList.filter(team => team.id !== teamId)))
    );
  }

  updateTeam(teamId: string, updateTeamDTO: UpdateTeamDTO, blobPhoto: Blob | undefined): Observable<Team> {
    return this._teamGateway.updateTeam(teamId, updateTeamDTO, blobPhoto).pipe(
      tap((updatedTeam) => this._teamsResource.update(teamsList => teamsList.map(team => team.id === updatedTeam.id ? updatedTeam : team)))
    );
  }
}
