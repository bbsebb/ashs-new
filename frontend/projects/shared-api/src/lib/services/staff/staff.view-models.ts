/**
 * View Model for the Staff Card component.
 */
export interface StaffCardViewModel {
  /** The unique identifier of the staff member. */
  id: string;
  /** First name. */
  firstName: string;
  /** Last name. */
  lastName: string;
  /** Full name (First Last). */
  fullName: string;
  /** Email address. */
  email: string | null;
  /** Phone number. */
  phone: string | null;
  /** Full URL to the staff avatar. */
  avatarUrl: string | null;
  /** List of assigned teams to display in the card. */
  assignedTeams: StaffTeamViewModel[];
}

/**
 * View Model for a team assigned to a staff member.
 */
export interface StaffTeamViewModel {
  /** Team identifier. */
  id: string;
  /** The season name (e.g. "2024-2025"). */
  seasonName: string;
  /** Formatted team name (e.g. "-18 ans 1"). */
  teamLabel: string;
  /** Formatted role name (e.g. "Entraineur"). */
  roleLabel: string;
}

/**
 * View Model for the compact Staff Mini Card.
 */
export interface StaffMiniCardViewModel {
  /** The unique identifier of the staff member. */
  id: string;
  /** Full name (First Last). */
  fullName: string;
  /** Role in the specific context (e.g., Coach). */
  roleLabel: string;
  /** Full URL to the staff avatar. */
  avatarUrl: string | null;
}
