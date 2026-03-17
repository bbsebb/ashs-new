import {inject, Injectable} from '@angular/core';
import {HttpClient, httpResource, HttpResourceRef} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {Team} from '@shared-domain';
import {APP_CONFIG} from '../../configs/app-config';
import {CreateTeamDTO, TeamResponseDTO, UpdateTeamDTO} from './team.dtos';

const API_VERSION = '/api/v1';
const API_NAME = "teams"

@Injectable({
  providedIn: 'root',
})
export class TeamGateway {
  private readonly _http = inject(HttpClient);
  private readonly _appConfig = inject(APP_CONFIG);

  getTeams(): HttpResourceRef<Team[]> {
    return httpResource<Team[]>(() => `${this._appConfig.apiUrl}${API_VERSION}/${API_NAME}`, {
      parse: (response: unknown) => {
        return this.parseTeams(response).map(teamResponseDTO => this.toTeam(teamResponseDTO));
      },
      defaultValue: []
    });
  }


  createTeam(createTeamDTO: CreateTeamDTO): Observable<Team> {
    return this._http.post<TeamResponseDTO>(`${this._appConfig.apiUrl}${API_VERSION}/${API_NAME}`, createTeamDTO).pipe(
      map(teamResponseDTO => this.toTeam(teamResponseDTO))
    );
  }

  deleteById(teamId: string): Observable<void> {
    return this._http.delete<void>(`${this._appConfig.apiUrl}${API_VERSION}/${API_NAME}/${teamId}`);
  }

  updateTeam(teamId: string, updateTeamDTO: UpdateTeamDTO): Observable<Team> {
    return this._http.put<TeamResponseDTO>(`${this._appConfig.apiUrl}${API_VERSION}/${API_NAME}/${teamId}`, updateTeamDTO).pipe(
      map(teamResponseDTO => this.toTeam(teamResponseDTO))
    );
  }

  private toTeam(teamResponseDTO: TeamResponseDTO): Team {
    return {
      id: teamResponseDTO.id,
      seasonId: teamResponseDTO.seasonId,
      gender: teamResponseDTO.gender,
      teamNumber: teamResponseDTO.name.teamNumber,
      ageGroup: teamResponseDTO.name.ageGroup
    };
  }

  private parseTeams(response: unknown): TeamResponseDTO[] {
    if (!Array.isArray(response)) {
      throw new Error('Réponse API invalide: attendu un tableau d équipes.');
    }

    const teams: TeamResponseDTO[] = [];

    for (const item of response) {
      if (!this.isTeamResponseDTO(item)) {
        throw new Error('Réponse API invalide: un élément du tableau ne correspond pas à TeamResponseDTO.');
      }
      teams.push(item);
    }

    return teams;
  }

  private isTeamResponseDTO(value: unknown): value is TeamResponseDTO {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const teamResponseRecord = value as Record<string, unknown>;
    const teamNameRecord = teamResponseRecord['name'];

    if (typeof teamNameRecord !== 'object' || teamNameRecord === null) {
      return false;
    }

    const ageGroupRecord = (teamNameRecord as Record<string, unknown>)['ageGroup'];

    if (typeof ageGroupRecord !== 'object' || ageGroupRecord === null) {
      return false;
    }

    return (
      typeof teamResponseRecord['id'] === 'string' &&
      typeof teamResponseRecord['seasonId'] === 'string' &&
      typeof teamResponseRecord['gender'] === 'string' &&
      typeof (teamNameRecord as Record<string, unknown>)['teamNumber'] === 'number' &&
      typeof (ageGroupRecord as Record<string, unknown>)['id'] === 'string' &&
      typeof (ageGroupRecord as Record<string, unknown>)['ageLimit'] === 'number' &&
      typeof (ageGroupRecord as Record<string, unknown>)['upperLimit'] === 'boolean' &&
      typeof (ageGroupRecord as Record<string, unknown>)['name'] === 'string' &&
      Array.isArray(teamResponseRecord['staffs']) &&
      Array.isArray(teamResponseRecord['trainingSessions'])
    );
  }
}
