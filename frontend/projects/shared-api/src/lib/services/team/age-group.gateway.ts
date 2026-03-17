import {inject, Injectable} from '@angular/core';
import {HttpClient, httpResource, HttpResourceRef} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AgeGroup} from '@shared-domain';
import {APP_CONFIG} from '@shared-api';
import {CreateAgeGroupDTO, UpdateAgeGroupDTO} from './age-group.dtos';

const API_VERSION = '/api/v1';
const API_NAME = "age-groups"

@Injectable({
  providedIn: 'root',
})
export class AgeGroupGateway {
  private readonly _http = inject(HttpClient);
  private readonly _appConfig = inject(APP_CONFIG);

  getAgeGroups(): HttpResourceRef<AgeGroup[]> {
    return httpResource<AgeGroup[]>(() => `${this._appConfig.apiUrl}${API_VERSION}/${API_NAME}`, {
      defaultValue: []
    });
  }

  addAgeGroup(createAgeGroupDTO: CreateAgeGroupDTO): Observable<AgeGroup> {
    return this._http.post<AgeGroup>(`${this._appConfig.apiUrl}${API_VERSION}/${API_NAME}`, createAgeGroupDTO);
  }

  deleteById(id: string): Observable<void> {
    return this._http.delete<void>(`${this._appConfig.apiUrl}${API_VERSION}/${API_NAME}/${id}`);
  }

  updateAgeGroup(id: string, updateAgeGroupDTO: UpdateAgeGroupDTO): Observable<AgeGroup> {
    return this._http.put<AgeGroup>(`${this._appConfig.apiUrl}${API_VERSION}/${API_NAME}/${id}`, updateAgeGroupDTO);
  }
}
