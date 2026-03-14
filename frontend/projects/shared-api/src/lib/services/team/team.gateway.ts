import {inject, Injectable} from '@angular/core';
import {HttpClient, httpResource, HttpResourceRef} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AgeGroup, Team} from '@shared-domain';
import {APP_CONFIG} from '../../configs/app-config';
import {CreateTeamDTO, EditTeamDTO, AgeGroupDTO} from './team.dtos';

@Injectable({
  providedIn: 'root',
})
export class TeamGateway {
  private readonly _http = inject(HttpClient);
  private readonly _appConfig = inject(APP_CONFIG);

  getTeams(): HttpResourceRef<Team[]> {
    return httpResource<Team[]>(() => `${this._appConfig.apiUrl}/api/v1/teams`, {
      defaultValue: []
    });
  }

  getAgeGroups(): HttpResourceRef<AgeGroup[]> {
    return httpResource<AgeGroup[]>(() => `${this._appConfig.apiUrl}/api/v1/teams/age-groups`, {
      defaultValue: []
    });
  }

  addTeam(createTeamDTO: CreateTeamDTO): Observable<Team> {
    return this._http.post<Team>(`${this._appConfig.apiUrl}/api/v1/teams`, createTeamDTO);
  }

  deleteById(teamId: string): Observable<void> {
    return this._http.delete<void>(`${this._appConfig.apiUrl}/api/v1/teams/${teamId}`);
  }

  editTeam(teamId: string, editTeamDTO: EditTeamDTO): Observable<Team> {
    return this._http.put<Team>(`${this._appConfig.apiUrl}/api/v1/teams/${teamId}`, editTeamDTO);
  }
}
