import {inject, Injectable} from '@angular/core';
import {HttpClient, httpResource, HttpResourceRef} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Hall} from '@shared-domain';
import {APP_CONFIG} from '../../configs/app-config';
import {CreateHallDTO, UpdateHallDTO} from './hall.dtos';

/**
 * Gateway for Hall-related API calls.
 * Uses Angular's HttpClient for mutations and httpResource for data retrieval.
 */
@Injectable({
  providedIn: 'root',
})
export class HallGateway {
  private readonly http = inject(HttpClient);
  private readonly appConfig = inject(APP_CONFIG);

  /**
   * Retrieves the list of all halls using httpResource.
   * @returns An HttpResourceRef containing the list of halls.
   */
  getHalls(): HttpResourceRef<Hall[]> {
    return httpResource<Hall[]>(() => `${this.appConfig.apiUrl}/api/v1/halls`, {
      defaultValue: []
    });
  }

  /**
   * Adds a new hall.
   * @param createHallDTO The data for the new hall.
   * @returns An Observable of the created Hall.
   */
  addHall(createHallDTO: CreateHallDTO): Observable<Hall> {
    return this.http.post<Hall>(`${this.appConfig.apiUrl}/api/v1/halls`, createHallDTO);
  }

  /**
   * Deletes a hall by its ID.
   * @param id The unique identifier of the hall to delete.
   * @returns An Observable that completes when the deletion is done.
   */
  deleteById(id: string): Observable<void> {
    return this.http.delete<void>(`${this.appConfig.apiUrl}/api/v1/halls/${id}`);
  }

  /**
   * Updates an existing hall.
   * @param id The unique identifier of the hall to update.
   * @param updateHallDTO The updated data for the hall.
   * @returns An Observable of the updated Hall.
   */
  updateHall(id: string, updateHallDTO: UpdateHallDTO): Observable<Hall> {
    return this.http.put<Hall>(`${this.appConfig.apiUrl}/api/v1/halls/${id}`, updateHallDTO);
  }
}
