import {inject, Injectable} from '@angular/core';
import {HttpClient, httpResource, HttpResourceRef} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AgeGroup} from '@shared-domain';
import {APP_CONFIG} from '../../configs/app-config';
import {CreateAgeGroupDTO, UpdateAgeGroupDTO} from './age-group.dtos';

const API_VERSION = '/api/v1';
const API_NAME = "age-groups"

/**
 * Gateway for AgeGroup-related API calls.
 */
@Injectable({
  providedIn: 'root',
})
export class AgeGroupGateway {
  private readonly _http = inject(HttpClient);
  private readonly _appConfig = inject(APP_CONFIG);

  /**
   * Retrieves all age groups using httpResource.
   * @returns An HttpResourceRef containing the list of age groups.
   */
  getAgeGroups(): HttpResourceRef<AgeGroup[]> {
    return httpResource<AgeGroup[]>(() => `${this._appConfig.apiUrl}${API_VERSION}/${API_NAME}`, {
      defaultValue: []
    });
  }

  /**
   * Adds a new age group.
   * @param createAgeGroupDTO The data for the new age group.
   * @returns An Observable of the created AgeGroup.
   */
  addAgeGroup(createAgeGroupDTO: CreateAgeGroupDTO): Observable<AgeGroup> {
    return this._http.post<AgeGroup>(`${this._appConfig.apiUrl}${API_VERSION}/${API_NAME}`, createAgeGroupDTO);
  }

  /**
   * Deletes an age group by its ID.
   * @param id The unique identifier of the age group to delete.
   * @returns An Observable that completes when the deletion is done.
   */
  deleteById(id: string): Observable<void> {
    return this._http.delete<void>(`${this._appConfig.apiUrl}${API_VERSION}/${API_NAME}/${id}`);
  }

  /**
   * Updates an existing age group.
   * @param id The unique identifier of the age group to update.
   * @param updateAgeGroupDTO The updated data.
   * @returns An Observable of the updated AgeGroup.
   */
  updateAgeGroup(id: string, updateAgeGroupDTO: UpdateAgeGroupDTO): Observable<AgeGroup> {
    return this._http.put<AgeGroup>(`${this._appConfig.apiUrl}${API_VERSION}/${API_NAME}/${id}`, updateAgeGroupDTO);
  }
}
