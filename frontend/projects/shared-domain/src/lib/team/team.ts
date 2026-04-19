import {AgeGroup} from './age-group';
import {Gender} from './gender';
import {DayOfWeek} from './day-of-week';
import {StaffRoleValue} from '../staff/staff-role';

/**
 * Represents a sports team within a specific season.
 */
export interface Team {
  /** Unique identifier for the team */
  id: string;
  /** Reference to the season the team belongs to */
  seasonId: string;
  /** Team gender category */
  gender: Gender;
  /** Internal team number (e.g., Team 1, Team 2) */
  teamNumber: number;
  /** Filename of the team's official photo */
  photoFileName: string | null;
  /** Age group classification */
  ageGroup: AgeGroup;
  /** List of staff members associated with the team */
  staffs: StaffView[];
  /** Scheduled training sessions for the team */
  trainingSessions: TrainingSessionView[];
}

/**
 * Simplified view of a staff member assigned to a team.
 */
export interface StaffView {
  /** Unique identifier for the assignment */
  id: string;
  /** Role of the staff member in the team (e.g., COACH) */
  role: StaffRoleValue;
  /** Reference to the actual staff entity */
  staffId: string;
}

/**
 * Simplified view of a training session scheduled for a team.
 */
export interface TrainingSessionView {
  /** Unique identifier for the session */
  id: string;
  /** Reference to the hall where the session takes place */
  hallId: string;
  /** Day of the week the session is held */
  dayOfWeek: DayOfWeek;
  /** Time window for the session */
  timeSlot: TimeSlot;
}

/**
 * Represents a specific time range during a day.
 */
export type TimeSlot = {
  /** Start time of the slot */
  startTime: Date;
  /** End time of the slot */
  endTime: Date;
}
