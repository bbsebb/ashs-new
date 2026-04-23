import {computed, inject, Injectable, Signal} from '@angular/core';
import {Observable, tap} from 'rxjs';
import {StaffRoleValue, Team} from '@shared-domain';
import {TeamGateway} from './team.gateway';
import {CreateTeamDTO, UpdateTeamDTO} from './team.dtos';
import {StaffEventsService} from '../staff/staff-events.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

/**
 * Centralized state management for Teams using Angular Signals and Resources.
 * This store handles business logic for sorting teams and follows the Zero Reload Policy.
 */
@Injectable({
  providedIn: 'root',
})
export class TeamsStore {
  private readonly _teamGateway = inject(TeamGateway);
  private readonly _staffEventsService = inject(StaffEventsService);
  private readonly _teamsResource = this._teamGateway.getTeams();

  constructor() {
    this._staffEventsService.staffDeleted$
      .pipe(takeUntilDestroyed())
      .subscribe(staffId => this.onStaffDeleted(staffId));
  }

  /**
   * Signal containing the current list of teams, automatically sorted by business rules.
   */
  readonly teamsSignal: Signal<Team[]> = computed(() => {
    const teams = this._teamsResource.hasValue() ? this._teamsResource.value() : [];
    return [...teams].sort(TeamsStore.sortTeams);
  });

  /**
   * Business logic for sorting teams:
   * 1. Gender (Feminine > Masculine > Mixed)
   * 2. Age group limit direction
   * 3. Age limit value
   * 4. Team number
   * @param a First team to compare.
   * @param b Second team to compare.
   * @returns Comparison result.
   */
  public static sortTeams(a: Team, b: Team): number {
    // 1. Sort by gender
    if (a.gender !== b.gender) {
      return a.gender.localeCompare(b.gender);
    }
    // 2. Sort by upperLimit (false first)
    if (a.ageGroup.upperLimit !== b.ageGroup.upperLimit) {
      return a.ageGroup.upperLimit ? 1 : -1;
    }
    // 3. Sort by age limit
    if (a.ageGroup.ageLimit !== b.ageGroup.ageLimit) {
      return a.ageGroup.ageLimit - b.ageGroup.ageLimit;
    }
    // 4. Sort by team number
    return a.teamNumber - b.teamNumber;
  }

  /** Signal indicating if the teams are currently being loaded. */
  isLoadingSignal = this._teamsResource.isLoading;
  /** Signal containing any error that occurred during team loading. */
  errorSignal = this._teamsResource.error;

  /**
   * Returns a Signal for a specific team by its ID.
   * @param idSignal A Signal containing the ID of the team to find.
   * @returns A Signal that emits the found Team or undefined.
   */
  teamById(idSignal: Signal<string | undefined>): Signal<Team | undefined> {
    return computed(() => {
      const teamId = idSignal();
      if (!teamId) return undefined;

      return this.teamsSignal().find((team) => team.id === teamId);
    });
  }

  /**
   * Creates a new team and updates the local cache (Zero Reload Policy).
   * @param createTeamDTO The data for the new team.
   * @param blobPhoto Optional photo file.
   * @returns An Observable of the created Team.
   */
  createTeam(createTeamDTO: CreateTeamDTO, blobPhoto: Blob | undefined): Observable<Team> {
    return this._teamGateway.createTeam(createTeamDTO, blobPhoto).pipe(
      tap((createdTeam) => this._teamsResource.update(teamsList => [...teamsList, createdTeam]))
    );
  }

  /**
   * Manually reloads the teams resource from the API.
   */
  reload(): void {
    this._teamsResource.reload();
  }

  /**
   * Deletes a team by its ID and updates the local cache (Zero Reload Policy).
   * @param teamId The unique identifier of the team to delete.
   * @returns An Observable that completes when the deletion is done.
   */
  deleteById(teamId: string): Observable<void> {
    return this._teamGateway.deleteById(teamId).pipe(
      tap(() => this._teamsResource.update(teamsList => teamsList.filter(team => team.id !== teamId)))
    );
  }

  /**
   * Updates an existing team and updates the local cache (Zero Reload Policy).
   * @param teamId The unique identifier of the team to update.
   * @param updateTeamDTO The updated data.
   * @param blobPhoto Optional new photo file.
   * @returns An Observable of the updated Team.
   */
  updateTeam(teamId: string, updateTeamDTO: UpdateTeamDTO, blobPhoto: Blob | undefined): Observable<Team> {
    return this._teamGateway.updateTeam(teamId, updateTeamDTO, blobPhoto).pipe(
      tap((updatedTeam) => this._teamsResource.update(teamsList => teamsList.map(team => team.id === updatedTeam.id ? updatedTeam : team)))
    );
  }

  /**
   * Returns a Signal containing teams associated with a specific staff member.
   * @param staffIdSignal A Signal containing the staff ID.
   * @returns A Signal emitting an array of teams with their associated role.
   */
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

  /**
   * Updates the local cache when a staff member is deleted,
   * removing them from all teams (Zero Reload Policy).
   * @param staffID The unique identifier of the deleted staff member.
   */
  onStaffDeleted(staffID: string) {
    this._teamsResource.update(teamsList => teamsList.map(team => {
      return {
        ...team,
        staffs: team.staffs.filter(staff => staff.staffId !== staffID)
      }
    }))
  }
}
