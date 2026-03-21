import {inject, Injectable} from '@angular/core';
import {HttpClient, httpResource, HttpResourceRef} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {DAY_OF_WEEKS, DayOfWeek, GENDER, Gender, STAFF_ROLE_VALUE, StaffRoleValue, Team} from '@shared-domain';
import {APP_CONFIG} from '../../configs/app-config';
import {
  AgeGroupResponseDTO,
  CreateTeamDTO,
  TeamNameResponseDTO,
  TeamResponseDTO,
  TeamStaffResponseDTO,
  TimeSlotDTO,
  TrainingSessionResponseDTO,
  UpdateTeamDTO
} from './team.dtos';
import {parseLocalDateTime} from '../../utils/date-mapper';

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


  createTeam(createTeamDTO: CreateTeamDTO, blobPhoto: Blob | undefined): Observable<Team> {
    const formData = new FormData();
    if (blobPhoto) {
      formData.append('file', blobPhoto, 'avatar.png');
    }
    formData.append('data',
      new Blob([JSON.stringify(createTeamDTO)], {type: 'application/json'}))
    return this._http.post<TeamResponseDTO>(`${this._appConfig.apiUrl}${API_VERSION}/${API_NAME}`, formData).pipe(
      map(teamResponseDTO => this.toTeam(teamResponseDTO))
    );
  }


  updateTeam(teamId: string, updateTeamDTO: UpdateTeamDTO, blobPhoto: Blob | undefined): Observable<Team> {
    const formData = new FormData();
    if (blobPhoto) {
      formData.append('file', blobPhoto, 'avatar.png');
    }
    formData.append('data',
      new Blob([JSON.stringify(updateTeamDTO)], {type: 'application/json'}))
    return this._http.put<TeamResponseDTO>(`${this._appConfig.apiUrl}${API_VERSION}/${API_NAME}/${teamId}`, formData).pipe(
      map(teamResponseDTO => this.toTeam(teamResponseDTO))
    );
  }

  deleteById(teamId: string): Observable<void> {
    return this._http.delete<void>(`${this._appConfig.apiUrl}${API_VERSION}/${API_NAME}/${teamId}`);
  }


  private toTeam(teamResponseDTO: TeamResponseDTO): Team {
    return {
      id: teamResponseDTO.id,
      seasonId: teamResponseDTO.seasonId,
      gender: teamResponseDTO.gender,
      teamNumber: teamResponseDTO.name.teamNumber,
      ageGroup: teamResponseDTO.name.ageGroup,
      photoFileName: teamResponseDTO.photoFileName,
      staffs: teamResponseDTO.staffs.map(staff => ({
        id: staff.id,
        role: staff.role,
        staffId: staff.staffId
      })),
      trainingSessions: teamResponseDTO.trainingSessions.map(trainingSession => ({
        id: trainingSession.id,
        hallId: trainingSession.hallId,
        dayOfWeek: trainingSession.dayOfWeek,
        timeSlot: {
          startTime: parseLocalDateTime(trainingSession.timeSlot.startTime),
          endTime: parseLocalDateTime(trainingSession.timeSlot.endTime)
        }
      }))
    };
  }

  private parseTeams(response: unknown): TeamResponseDTO[] {

    if (!Array.isArray(response)) {
      console.error('Réponse API invalide: attendu un tableau d équipes.');
      throw new Error('Réponse API invalide: attendu un tableau d équipes.');
    }

    const teams: TeamResponseDTO[] = [];

    for (const item of response) {
      if (!this.isTeamResponseDTO(item)) {
        console.error('Réponse API invalide: un élément du tableau ne correspond pas à TeamResponseDTO.');
        throw new Error('Réponse API invalide: un élément du tableau ne correspond pas à TeamResponseDTO.');
      }
      teams.push(item);
    }

    return teams;
  }

  private isString(value: unknown): value is string {
    return typeof value === 'string';
  }

  private isNumber(value: unknown): value is number {
    return typeof value === 'number';
  }

  private isBoolean(value: unknown): value is boolean {
    return typeof value === 'boolean';
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private isStaffRole(value: unknown): value is StaffRoleValue {
    return typeof value === 'string' && STAFF_ROLE_VALUE.includes(value as StaffRoleValue);
  }

  private isGender(value: unknown): value is Gender {
    return typeof value === 'string' && GENDER.includes(value as Gender);
  }

  private isTimeSlotDTO(value: unknown): value is TimeSlotDTO {
    if (!this.isRecord(value)) {
      return false;
    }

    return this.isString(value['startTime']) && this.isString(value['endTime']);
  }

  private isDayOfWeek(value: unknown): value is DayOfWeek {
    return typeof value === 'string' && DAY_OF_WEEKS.includes(value as DayOfWeek);
  }

  private isTrainingSessionResponseDTO(value: unknown): value is TrainingSessionResponseDTO {
    if (!this.isRecord(value)) {
      return false;
    }

    return (
      this.isString(value['id']) &&
      this.isString(value['hallId']) &&
      this.isDayOfWeek(value['dayOfWeek']) &&
      this.isString(value['teamId']) &&
      this.isTimeSlotDTO(value['timeSlot'])
    );
  }

  private isAgeGroupResponseDTO(value: unknown): value is AgeGroupResponseDTO {
    if (!this.isRecord(value)) {
      return false;
    }

    return (
      this.isString(value['id']) &&
      this.isNumber(value['ageLimit']) &&
      this.isBoolean(value['upperLimit']) &&
      this.isString(value['name'])
    );
  }

  private isTeamNameResponseDTO(value: unknown): value is TeamNameResponseDTO {
    if (!this.isRecord(value)) {
      return false;
    }

    return (
      this.isNumber(value['teamNumber']) &&
      this.isAgeGroupResponseDTO(value['ageGroup'])
    );
  }

  private isTeamStaffResponseDTO(value: unknown): value is TeamStaffResponseDTO {
    if (!this.isRecord(value)) {
      return false;
    }

    return (
      this.isString(value['id']) &&
      this.isString(value['staffId']) &&
      this.isStaffRole(value['role'])
    );
  }

  private isTeamResponseDTO(value: unknown): value is TeamResponseDTO {
    if (!this.isRecord(value)) {
      return false;
    }

    return (
      this.isString(value['id']) &&
      this.isString(value['seasonId']) &&
      (value['photoFileName'] === null || this.isString(value['photoFileName'])) &&
      this.isGender(value['gender']) &&
      this.isTeamNameResponseDTO(value['name']) &&
      Array.isArray(value['staffs']) &&
      value['staffs'].every(item => this.isTeamStaffResponseDTO(item)) &&
      Array.isArray(value['trainingSessions']) &&
      value['trainingSessions'].every(item => this.isTrainingSessionResponseDTO(item))
    );
  }
}
