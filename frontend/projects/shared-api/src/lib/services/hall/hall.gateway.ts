import {inject, Injectable} from '@angular/core';
import {HttpClient, httpResource, HttpResourceRef} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Hall} from '@shared-domain';
import {APP_CONFIG} from '../../configs/app-config';
import {CreateHallDTO, UpdateHallDTO} from './hall.dtos';

@Injectable({
  providedIn: 'root',
})
export class HallGateway {
  private readonly http = inject(HttpClient);
  private readonly appConfig = inject(APP_CONFIG);

  getHalls(): HttpResourceRef<Hall[]> {
    return httpResource<Hall[]>(() => `${this.appConfig.apiUrl}/api/v1/halls`, {
      defaultValue: []
    });
  }

  addHall(createHallDTO: CreateHallDTO): Observable<Hall> {
    return this.http.post<Hall>(`${this.appConfig.apiUrl}/api/v1/halls`, createHallDTO);
  }

  deleteById(id: string): Observable<void> {
    return this.http.delete<void>(`${this.appConfig.apiUrl}/api/v1/halls/${id}`);
  }

  updateHall(id: string, updateHallDTO: UpdateHallDTO): Observable<Hall> {
    return this.http.put<Hall>(`${this.appConfig.apiUrl}/api/v1/halls/${id}`, updateHallDTO);
  }
}
