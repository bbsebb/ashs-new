import {Gender, Team} from '@shared-domain';

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
