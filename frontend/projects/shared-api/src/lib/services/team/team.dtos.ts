import {DayOfWeek, Gender, StaffRoleValue} from '@shared-domain';

/** DTO for creating a new team. */
export interface CreateTeamDTO {
  seasonId: string;
  gender: Gender;
  teamNumber: number;
  ageGroupId: string;
  staffs: CreateTeamStaffDOT[];
  trainingSessions: CreateTrainingSessionDTO[];
}

/** DTO for assigning a staff member to a team during creation. */
export interface CreateTeamStaffDOT {
  role: StaffRoleValue;
  staffId: string;
}

/** DTO for defining a training session during team creation. */
export interface CreateTrainingSessionDTO {
  hallId: string;
  dayOfWeek: string;
  timeSlot: TimeSlotDTO;
}

/** DTO for updating an existing team. */
export interface UpdateTeamDTO {
  seasonId: string;
  gender: Gender;
  teamNumber: number;
  ageGroupId: string;
  photoFileName: string | null;
  staffs: (CreateTeamStaffDOT | UpdateTeamStaffDOT)[];
  trainingSessions: (CreateTrainingSessionDTO | UpdateTrainingSessionDTO)[];
}

/** DTO for updating a staff assignment in a team. */
export interface UpdateTeamStaffDOT {
  id: string;
  role: StaffRoleValue;
  staffId: string;
}

/** DTO for updating a training session in a team. */
export interface UpdateTrainingSessionDTO {
  id: string;
  hallId: string;
  dayOfWeek: string;
  timeSlot: TimeSlotDTO;
}

/** API response DTO for a team. */
export interface TeamResponseDTO {
  id: string;
  seasonId: string;
  photoFileName: string | null;
  gender: Gender;
  name: TeamNameResponseDTO;
  staffs: TeamStaffResponseDTO[];
  trainingSessions: TrainingSessionResponseDTO[];
}

/** Internal structure of a team name in the API response. */
export interface TeamNameResponseDTO {
  teamNumber: number;
  ageGroup: AgeGroupResponseDTO;
}

/** API response DTO for an age group associated with a team. */
export interface AgeGroupResponseDTO {
  id: string;
  ageLimit: number;
  upperLimit: boolean;
  name: string;
}

/** API response DTO for a staff assignment. */
export interface TeamStaffResponseDTO {
  id: string;
  role: StaffRoleValue;
  staffId: string;
}

/** API response DTO for a training session. */
export interface TrainingSessionResponseDTO {
  id: string;
  hallId: string;
  dayOfWeek: DayOfWeek;
  timeSlot: TimeSlotDTO;
  teamId: string;
}

/** DTO for a time slot (start and end times as strings). */
export interface TimeSlotDTO {
  startTime: string,
  endTime: string
}
