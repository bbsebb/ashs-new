import {inject, Injectable} from '@angular/core';
import {HttpClient, httpResource, HttpResourceRef} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Staff} from '@shared-domain';
import {APP_CONFIG} from '../../configs/app-config';
import {CreateStaffDTO, UpdateStaffDTO} from './staff.dtos';


/**
 * Gateway for Staff-related API calls.
 * Handles staff creation and updates with multipart/form-data for avatar uploads.
 */
@Injectable({
  providedIn: 'root',
})
export class StaffGateway {
  private readonly http = inject(HttpClient);
  private readonly appConfig = inject(APP_CONFIG);

  /**
   * Retrieves all staff members using httpResource.
   * @returns An HttpResourceRef containing the list of staff.
   */
  getStaffs(): HttpResourceRef<Staff[]> {
    return httpResource<Staff[]>(() => `${this.appConfig.apiUrl}/api/v1/staffs`, {
      defaultValue: []
    });
  }

  /**
   * Adds a new staff member.
   * @param createStaffDTO The data for the new staff member.
   * @param blobAvatar Optional avatar file.
   * @returns An Observable of the created Staff.
   */
  addStaff(createStaffDTO: CreateStaffDTO, blobAvatar: Blob | undefined): Observable<Staff> {
    const formData = new FormData();
    if (blobAvatar) {
      formData.append('file', blobAvatar, 'avatar.png');
    }
    formData.append('data',
      new Blob([JSON.stringify(createStaffDTO)], {type: 'application/json'}))
    return this.http.post<Staff>(`${this.appConfig.apiUrl}/api/v1/staffs`, formData);
  }

  /**
   * Deletes a staff member by their ID.
   * @param id The unique identifier of the staff member to delete.
   * @returns An Observable that completes when done.
   */
  deleteById(id: string): Observable<void> {
    return this.http.delete<void>(`${this.appConfig.apiUrl}/api/v1/staffs/${id}`);
  }

  /**
   * Updates an existing staff member.
   * @param id The unique identifier of the staff member to update.
   * @param updateStaffDTO The updated data.
   * @param blobAvatar Optional new avatar file.
   * @returns An Observable of the updated Staff.
   */
  updateStaff(id: string, updateStaffDTO: UpdateStaffDTO, blobAvatar: Blob | undefined): Observable<Staff> {
    const formData = new FormData();
    if (blobAvatar) {
      formData.append('file', blobAvatar, 'avatar.png');
    }
    formData.append('data',
      new Blob([JSON.stringify(updateStaffDTO)], {type: 'application/json'}))
    return this.http.put<Staff>(`${this.appConfig.apiUrl}/api/v1/staffs/${id}`, formData);
  }
}
