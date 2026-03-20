import {DayOfWeek, Gender, StaffRoleValue} from '@shared-domain';

export interface CreateTeamDTO {
  seasonId: string;
  gender: Gender;
  teamNumber: number;
  ageGroupId: string;
  staffs: CreateTeamStaffDOT[];
  trainingSessions: CreateTrainingSessionDTO[];
}

export interface CreateTeamStaffDOT {
  role: StaffRoleValue;
  staffId: string;
}

export interface CreateTrainingSessionDTO {
  hallId: string;
  dayOfWeek: string;
  timeSlot: TimeSlotDTO;
}

export interface UpdateTeamDTO {
  seasonId: string;
  gender: Gender;
  teamNumber: number;
  ageGroupId: string;
  staffs: (CreateTeamStaffDOT | UpdateTeamStaffDOT)[];
  trainingSessions: (CreateTrainingSessionDTO | UpdateTrainingSessionDTO)[];
}

export interface UpdateTeamStaffDOT {
  id: string;
  role: StaffRoleValue;
  staffId: string;
}

export interface UpdateTrainingSessionDTO {
  id: string;
  hallId: string;
  dayOfWeek: string;
  timeSlot: TimeSlotDTO;
}


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
  role: StaffRoleValue;
  staffId: string;
}


export interface TrainingSessionResponseDTO {
  id: string;
  hallId: string;
  dayOfWeek: DayOfWeek;
  timeSlot: TimeSlotDTO;
  teamId: string;
}

export interface TimeSlotDTO {
  startTime: string,
  endTime: string
}
