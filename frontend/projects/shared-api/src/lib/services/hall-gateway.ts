import {inject, Injectable} from '@angular/core';


import {HttpClient, httpResource, HttpResourceRef} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CreateHallDTO} from './dtos/create-hall-dto';
import {Hall} from '../../../../shared-domain/src/lib/hall/models/hall';
import {APP_CONFIG} from '../configs/app-config';


@Injectable({
  providedIn: 'root',
})
export class HallGateway {
    private readonly http = inject(HttpClient);
    private readonly appConfig = inject(APP_CONFIG);
    getHalls():HttpResourceRef<Hall[]> {
        return httpResource<Hall[]>(() => `${this.appConfig.apiUrl}/api/v1/halls`,{
          defaultValue: []
        });
    }

    addHall(createHallDTO: CreateHallDTO): Observable<Hall> {
        return this.http.post<Hall>(`${this.appConfig.apiUrl}/api/v1/halls`, createHallDTO);
    }
}
