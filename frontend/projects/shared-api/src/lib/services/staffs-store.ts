import {computed, inject, Injectable, Signal} from '@angular/core';
import {StaffGateway} from './staff-gateway';
import {Observable, tap} from 'rxjs';
import {Staff} from '@shared-domain';
import {CreateStaffDTO, EditStaffDTO} from './dtos/staff-dto';


@Injectable({
  providedIn: 'root',
})
export class StaffsStore {
  private readonly staffGateway = inject(StaffGateway);
  private readonly staffsResource = this.staffGateway.getStaffs();
  readonly staffs: Signal<Staff[]> = computed(() => this.staffsResource.hasValue() ? this.staffsResource.value() : []);
  isLoading = this.staffsResource.isLoading;
  error = this.staffsResource.error;


  staffById(id: Signal<string | undefined>): Signal<Staff | undefined> {
    return computed(() => {
      const staffId = id();
      if (!staffId) return undefined;

      return this.staffs().find((staff) => staff.id === staffId);
    });
  }

  createStaff(createStaffDTO: CreateStaffDTO, blobAvatar: Blob | undefined): Observable<Staff> {
    return this.staffGateway.addStaff(createStaffDTO, blobAvatar).pipe(
      tap(() => this.reload())
    );
  }

  reload(): void {
    this.staffsResource.reload();
  }


  deleteById(id: string): Observable<void> {
    return this.staffGateway.deleteById(id).pipe(
      tap(() => this.reload())
    );
  }

  editStaff(id: string, editStaffDTO: EditStaffDTO, blobAvatar: Blob | undefined): Observable<Staff> {
    return this.staffGateway.editStaff(id, editStaffDTO, blobAvatar).pipe(
      tap(() => this.reload())
    );
  }
}
