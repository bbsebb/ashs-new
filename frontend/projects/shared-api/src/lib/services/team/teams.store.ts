import {computed, inject, Injectable, Signal} from '@angular/core';
import {Observable, tap} from 'rxjs';
import {StaffRoleValue, Team} from '@shared-domain';
import {TeamGateway} from './team.gateway';
import {CreateTeamDTO, UpdateTeamDTO} from './team.dtos';

@Injectable({
  providedIn: 'root',
})
export class TeamsStore {
  private readonly _teamGateway = inject(TeamGateway);
  private readonly _teamsResource = this._teamGateway.getTeams();
  readonly teamsSignal: Signal<Team[]> = computed(() => {
    const teams = this._teamsResource.hasValue() ? this._teamsResource.value() : [];
    return [...teams].sort(TeamsStore.sortTeams);
  });

  /**
   * Logique de tri métier des équipes :
   * 1. Genre (Féminin > Masculin > Mixte)
   * 2. Sens de la limite (Sans limite "Moins de" d'abord)
   * 3. Limite d'âge (Croissant)
   * 4. Numéro d'équipe (Croissant)
   */
  public static sortTeams(a: Team, b: Team): number {
    // 1. Tri par genre
    if (a.gender !== b.gender) {
      return a.gender.localeCompare(b.gender);
    }
    // 2. Tri par upperLimit (false d'abord)
    if (a.ageGroup.upperLimit !== b.ageGroup.upperLimit) {
      return a.ageGroup.upperLimit ? 1 : -1;
    }
    // 3. Tri par limite d'âge
    if (a.ageGroup.ageLimit !== b.ageGroup.ageLimit) {
      return a.ageGroup.ageLimit - b.ageGroup.ageLimit;
    }
    // 4. Tri par numéro d'équipe
    return a.teamNumber - b.teamNumber;
  }


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

  teamsByStaffId(staffIdSignal: Signal<string | undefined>) {
    return computed(() => {
      const staffId = staffIdSignal();
      if (!staffId) return [];

      return this.teamsSignal()
        .map(team => {
          const assignment = team.staffs.find(s => s.staffId === staffId);
          return assignment ? {...team, role: assignment.role as StaffRoleValue} : null;
        })
        .filter((team): team is (Team & { role: StaffRoleValue }) => team !== null);
    });
  }

  onStaffDeleted(staffID: string) {
    this._teamsResource.update(teamsList => teamsList.map(team => {
      return {
        ...team,
        staffs: team.staffs.filter(staff => staff.staffId !== staffID)
      }
    }))
  }
}
