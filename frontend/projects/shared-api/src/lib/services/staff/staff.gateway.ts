import {inject, Injectable} from '@angular/core';
import {HttpClient, httpResource, HttpResourceRef} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Staff} from '@shared-domain';
import {APP_CONFIG} from '../../configs/app-config';
import {CreateStaffDTO, EditStaffDTO} from './staff.dtos';


@Injectable({
  providedIn: 'root',
})
export class StaffGateway {
  private readonly http = inject(HttpClient);
  private readonly appConfig = inject(APP_CONFIG);

  getStaffs(): HttpResourceRef<Staff[]> {
    return httpResource<Staff[]>(() => `${this.appConfig.apiUrl}/api/v1/staffs`, {
      defaultValue: []
    });
  }

  addStaff(createStaffDTO: CreateStaffDTO, blobAvatar: Blob | undefined): Observable<Staff> {
    const formData = new FormData();
    if (blobAvatar) {
      formData.append('file', blobAvatar, 'avatar.png');
    }
    formData.append('data',
      new Blob([JSON.stringify(createStaffDTO)], {type: 'application/json'}))
    return this.http.post<Staff>(`${this.appConfig.apiUrl}/api/v1/staffs`, formData);
  }

  deleteById(id: string): Observable<void> {
    return this.http.delete<void>(`${this.appConfig.apiUrl}/api/v1/staffs/${id}`);
  }

  editStaff(id: string, editStaffDTO: EditStaffDTO, blobAvatar: Blob | undefined): Observable<Staff> {
    const formData = new FormData();
    if (blobAvatar) {
      formData.append('file', blobAvatar, 'avatar.png');
    }
    formData.append('data',
      new Blob([JSON.stringify(editStaffDTO)], {type: 'application/json'}))
    return this.http.put<Staff>(`${this.appConfig.apiUrl}/api/v1/staffs/${id}`, formData);
  }
}
