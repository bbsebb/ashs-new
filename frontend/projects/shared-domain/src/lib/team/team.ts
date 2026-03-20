import {AgeGroup} from './age-group';

export const GENDER = ['Female', 'Male', 'Mixte'] as const;

export type Gender = typeof GENDER[number];

export const STAFF_ROLE_VALUE = ['COACH', 'ASSISTANT', 'SUPPORT'] as const;

export type StaffRoleValue = typeof STAFF_ROLE_VALUE[number];


export const DAY_OF_WEEKS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;

export type DayOfWeek = typeof DAY_OF_WEEKS[number];

export interface Team {
  id: string;
  seasonId: string;
  gender: Gender;
  teamNumber: number;
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


