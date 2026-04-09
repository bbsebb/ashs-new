import {AgeGroup} from './age-group';
import {Gender} from './gender';
import {DayOfWeek} from './day-of-week';
import {StaffRoleValue} from '../staff/staff-role';

export interface Team {
  id: string;
  seasonId: string;
  gender: Gender;
  teamNumber: number;
  photoFileName: string | null;
  ageGroup: AgeGroup;
  staffs: StaffView[],
  trainingSessions: TrainingSessionView[]
}

export interface StaffView {
  id: string;
  role: StaffRoleValue;
  staffId: string;
}

export interface TrainingSessionView {
  id: string,
  hallId: string,
  dayOfWeek: DayOfWeek,
  timeSlot: TimeSlot
}

export type TimeSlot = {
  startTime: Date,
  endTime: Date
}
