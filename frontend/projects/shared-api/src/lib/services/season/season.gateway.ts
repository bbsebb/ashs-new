import {inject, Injectable} from '@angular/core';
import {HttpClient, httpResource, HttpResourceRef} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {Season} from '@shared-domain';
import {APP_CONFIG} from '../../configs/app-config';
import {CreateSeasonDTO, UpdateSeasonDTO} from './season.dtos';

@Injectable({
  providedIn: 'root',
})
export class SeasonGateway {
  private readonly http = inject(HttpClient);
  private readonly appConfig = inject(APP_CONFIG);

  getSeasons(): HttpResourceRef<Season[]> {
    return httpResource<Season[]>(() => `${this.appConfig.apiUrl}/api/v1/seasons`, {
      parse: (response: unknown) => {
        return this.parseSeasons(response).map(this.toSeason)
      },
      defaultValue: [],
    });
  }

  addSeason(createSeasonDTO: CreateSeasonDTO): Observable<Season> {
    return this.http.post<SeasonResponseDTO>(`${this.appConfig.apiUrl}/api/v1/seasons`, createSeasonDTO).pipe(
      map(response => this.toSeason(response))
    );
  }

  deleteById(id: string): Observable<void> {
    return this.http.delete<void>(`${this.appConfig.apiUrl}/api/v1/seasons/${id}`);
  }

  updateSeason(id: string, updateSeasonDTO: UpdateSeasonDTO): Observable<Season> {
    return this.http.put<SeasonResponseDTO>(`${this.appConfig.apiUrl}/api/v1/seasons/${id}`, updateSeasonDTO).pipe(
      map(response => this.toSeason(response)),
    );
  }

  toSeason(seasonResponseDTO: SeasonResponseDTO): Season {
    return {
      id: seasonResponseDTO.id,
      startDate: new Date(seasonResponseDTO.startDate),
      endDate: new Date(seasonResponseDTO.endDate),
      name: seasonResponseDTO.name,
      isCurrent: seasonResponseDTO.isCurrent,
      isActive: seasonResponseDTO.isActive
    }
  }

  private parseSeasons(response: unknown): SeasonResponseDTO[] {
    if (!Array.isArray(response)) {
      throw new Error('Réponse API invalide: attendu un tableau de saisons.');
    }
    const seasons: SeasonResponseDTO[] = [];
    for (const item of response) {
      if (!this.isSeasonResponseDTO(item)) {
        throw new Error('Réponse API invalide: un élément du tableau ne correspond pas à SeasonResponseDTO.');
      }
      seasons.push(item);
    }
    return seasons;
  }

  private isSeasonResponseDTO(value: unknown): value is SeasonResponseDTO {
    if (typeof value !== 'object' || value === null) return false;
    const v = value as Record<string, unknown>;
    return (
      typeof v['id'] === 'string' &&
      typeof v['name'] === 'string' &&
      typeof v['startDate'] === 'string' &&
      typeof v['endDate'] === 'string' &&
      typeof v['isCurrent'] === 'boolean'
    );
  }
}

interface SeasonResponseDTO {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isCurrent: boolean;
}
