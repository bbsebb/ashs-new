import {DayOfWeek, Gender, StaffRoleValue} from '@shared-domain';

/**
 * View Model for the Team Card component.
 */
export interface TeamCardViewModel {
  /** The unique identifier of the team. */
  id: string;
  /** The full URL to the team photo. */
  photoUrl: string | null;
  /** Short category label (e.g., "-18 ans"). */
  categoryLabelShort: string;
  /** Long category label (e.g., "Moins de 18 ans"). */
  categoryLabelLong: string;
  /** Gender of the team. */
  gender: Gender;
  /** Team number (if > 1). */
  teamNumber: number;
  /** List of assigned staff members. */
  staffs: TeamStaffViewModel[];
  /** List of training sessions. */
  trainingSessions: TeamTrainingSessionViewModel[];
}

/**
 * View Model for staff members assigned to a team.
 */
export interface TeamStaffViewModel {
  /** Staff identifier. */
  id: string;
  /** Full name (First Last). */
  fullName: string;
  /** Role in the team (e.g., "Entraineur"). */
  roleLabel: string;
  /** The technical role value. */
  role: StaffRoleValue;
  /** Full URL to the staff avatar. */
  avatarUrl: string | null;
}

/**
 * View Model for training sessions.
 */
export interface TeamTrainingSessionViewModel {
  /** Day of the week. */
  dayOfWeek: DayOfWeek;
  /** Start time of the session. */
  startTime: Date;
  /** End time of the session. */
  endTime: Date;
  /** Name of the hall. */
  hallName: string;
  /** Hall identifier. */
  hallId: string;
}

/**
 * View Model for the compact Team Mini Card.
 */
export interface TeamMiniCardViewModel {
  /** The unique identifier of the team. */
  id: string;
  /** Category and team number label. */
  categoryAndNumberLabel: string;
  /** Gender label. */
  genderLabel: string;
}
