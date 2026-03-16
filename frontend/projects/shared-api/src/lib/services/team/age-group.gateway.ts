import {inject, Injectable} from '@angular/core';
import {HttpClient, httpResource, HttpResourceRef} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AgeGroup} from '@shared-domain';
import {APP_CONFIG} from '@shared-api';
import {CreateAgeGroupDTO, UpdateAgeGroupDTO} from './age-group.dtos';

@Injectable({
  providedIn: 'root',
})
export class AgeGroupGateway {
  private readonly http = inject(HttpClient);
  private readonly appConfig = inject(APP_CONFIG);

  getAgeGroups(): HttpResourceRef<AgeGroup[]> {
    return httpResource<AgeGroup[]>(() => `${this.appConfig.apiUrl}/api/v1/age-group`, {
      defaultValue: []
    });
  }

  addAgeGroup(createAgeGroupDTO: CreateAgeGroupDTO): Observable<AgeGroup> {
    return this.http.post<AgeGroup>(`${this.appConfig.apiUrl}/api/v1/age-group`, createAgeGroupDTO);
  }

  deleteById(id: string): Observable<void> {
    return this.http.delete<void>(`${this.appConfig.apiUrl}/api/v1/age-group/${id}`);
  }

  updateAgeGroup(id: string, updateAgeGroupDTO: UpdateAgeGroupDTO): Observable<AgeGroup> {
    return this.http.put<AgeGroup>(`${this.appConfig.apiUrl}/api/v1/age-group/${id}`, updateAgeGroupDTO);
  }
}
