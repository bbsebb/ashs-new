import {computed, inject, Injectable, Signal} from '@angular/core';
import {Observable, tap} from 'rxjs';
import {Staff} from '@shared-domain';
import {StaffGateway} from './staff.gateway';
import {CreateStaffDTO, UpdateStaffDTO} from './staff.dtos';
import {TeamsStore} from '../team/teams.store';


/**
 * Centralized state management for Staff members using Angular Signals and Resources.
 * This store coordinates with TeamsStore when a staff member is deleted (Zero Reload Policy).
 */
@Injectable({
  providedIn: 'root',
})
export class StaffsStore {
  private readonly _teamsStore = inject(TeamsStore);
  private readonly _staffGateway = inject(StaffGateway);
  private readonly _staffsResource = this._staffGateway.getStaffs();

  /** Signal containing the current list of staff members. */
  readonly staffsSignal: Signal<Staff[]> = computed(() => this._staffsResource.hasValue() ? this._staffsResource.value() : []);
  /** Signal indicating if the staff list is loading. */
  isLoadingSignal = this._staffsResource.isLoading;
  /** Signal containing any error that occurred during loading. */
  errorSignal = this._staffsResource.error;

  /**
   * Returns a Signal for a specific staff member by their ID.
   * @param staffIdSignal A Signal containing the ID.
   * @returns A Signal emitting the found Staff or undefined.
   */
  staffById(staffIdSignal: Signal<string | undefined>): Signal<Staff | undefined> {
    return computed(() => {
      const staffId = staffIdSignal();
      if (!staffId) return undefined;

      return this.staffsSignal().find((staff) => staff.id === staffId);
    });
  }

  /**
   * Creates a new staff member and updates the local cache (Zero Reload Policy).
   * @param createStaffDTO Data for the new staff member.
   * @param blobAvatar Optional avatar file.
   * @returns An Observable of the created Staff.
   */
  createStaff(createStaffDTO: CreateStaffDTO, blobAvatar: Blob | undefined): Observable<Staff> {
    return this._staffGateway.addStaff(createStaffDTO, blobAvatar).pipe(
      tap((createdStaff) => this._staffsResource.update(staffsList => staffsList ? [...staffsList, createdStaff] : [createdStaff]))
    );
  }

  /**
   * Manually reloads the staff resource.
   */
  reload(): void {
    this._staffsResource.reload();
  }

  /**
   * Deletes a staff member and updates the local cache (Zero Reload Policy).
   * Also triggers local cleanup in TeamsStore.
   * @param staffId The unique identifier of the staff member to delete.
   * @returns An Observable that completes when done.
   */
  deleteById(staffId: string): Observable<void> {
    return this._staffGateway.deleteById(staffId).pipe(
      tap(() => this._staffsResource.update(staffsList => staffsList ? staffsList.filter(staff => staff.id !== staffId) : [])),
      tap(() => this._teamsStore.onStaffDeleted(staffId))
    );
  }

  /**
   * Updates a staff member and updates the local cache (Zero Reload Policy).
   * @param staffId The ID of the staff to update.
   * @param updateStaffDTO The updated data.
   * @param blobAvatar Optional new avatar file.
   * @returns An Observable of the updated Staff.
   */
  updateStaff(staffId: string, updateStaffDTO: UpdateStaffDTO, blobAvatar: Blob | undefined): Observable<Staff> {
    return this._staffGateway.updateStaff(staffId, updateStaffDTO, blobAvatar).pipe(
      tap((updatedStaff) => this._staffsResource.update(staffsList => staffsList ? staffsList.map(staff => staff.id === updatedStaff.id ? updatedStaff : staff) : [updatedStaff]))
    );
  }
}
