import {inject, Injectable} from '@angular/core';


import {HttpClient, httpResource, HttpResourceRef} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CreateHallDTO} from './dtos/create-hall-dto';
import {Hall} from '@shared-domain';
import {APP_CONFIG} from '../configs/app-config';
import {EditHallDTO} from './dtos/edit-hall-dto';


@Injectable({
  providedIn: 'root',
})
export class HallGateway {
  private readonly http = inject(HttpClient);
  private readonly appConfig = inject(APP_CONFIG);

  getHalls(): HttpResourceRef<Hall[]> {
    console.log(this.appConfig)
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

  editHall(id: string, createHallDTO: EditHallDTO) {
    return this.http.put<void>(`${this.appConfig.apiUrl}/api/v1/halls/${id}`, createHallDTO);
  }
}
