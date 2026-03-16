import {Gender} from '@shared-domain';

export interface CreateTeamDTO {
  seasonId: string;
  gender: Gender;
  teamNumber: number;
  ageGroupId: string;
}

export type EditTeamDTO = CreateTeamDTO;

export interface AgeGroupDTO {
  uuid: string;
  ageLimit: number;
  isUpperLimit: boolean;
}

export interface TeamResponseDTO {
  id: string;
  seasonId: string;
  gender: Gender;
  name: TeamNameResponseDTO;
  staffs: TeamStaffResponseDTO[];
  trainingSessions: TrainingSessionResponseDTO[];
}

export interface TeamNameResponseDTO {
  teamNumber: number;
  ageGroup: AgeGroupResponseDTO;
}

export interface AgeGroupResponseDTO {
  id: string;
  ageLimit: number;
  upperLimit: boolean;
  name: string;
}

export interface TeamStaffResponseDTO {
  id: string;
  role: string;
  coachId: string;
}

export interface TrainingSessionResponseDTO {
  id: string;
  hallId: string;
  timeSlot: unknown;
  teamId: string;
}
