import {computed, inject, Injectable, Signal} from '@angular/core';
import {Observable, tap} from 'rxjs';
import {Staff} from '@shared-domain';
import {StaffGateway} from './staff.gateway';
import {CreateStaffDTO, EditStaffDTO} from './staff.dtos';


@Injectable({
  providedIn: 'root',
})
export class StaffsStore {
  private readonly _staffGateway = inject(StaffGateway);
  private readonly _staffsResource = this._staffGateway.getStaffs();
  readonly staffsSignal: Signal<Staff[]> = computed(() => this._staffsResource.hasValue() ? this._staffsResource.value() : []);
  isLoadingSignal = this._staffsResource.isLoading;
  errorSignal = this._staffsResource.error;


  staffById(staffIdSignal: Signal<string | undefined>): Signal<Staff | undefined> {
    return computed(() => {
      const staffId = staffIdSignal();
      if (!staffId) return undefined;

      return this.staffsSignal().find((staff) => staff.id === staffId);
    });
  }

  createStaff(createStaffDTO: CreateStaffDTO, blobAvatar: Blob | undefined): Observable<Staff> {
    return this._staffGateway.addStaff(createStaffDTO, blobAvatar).pipe(
      tap((createdStaff) => this._staffsResource.update(staffsList => staffsList ? [...staffsList, createdStaff] : [createdStaff]))
    );
  }

  reload(): void {
    this._staffsResource.reload();
  }


  deleteById(staffId: string): Observable<void> {
    return this._staffGateway.deleteById(staffId).pipe(
      tap(() => this._staffsResource.update(staffsList => staffsList ? staffsList.filter(staff => staff.id !== staffId) : []))
    );
  }

  editStaff(staffId: string, editStaffDTO: EditStaffDTO, blobAvatar: Blob | undefined): Observable<Staff> {
    return this._staffGateway.editStaff(staffId, editStaffDTO, blobAvatar).pipe(
      tap((updatedStaff) => this._staffsResource.update(staffsList => staffsList ? staffsList.map(staff => staff.id === updatedStaff.id ? updatedStaff : staff) : [updatedStaff]))
    );
  }
}
