import {UUID} from '../uuid';

/**
 * Represents a staff member of the club.
 */
export interface Staff {
  /** Unique identifier for the staff member */
  id: UUID;
  /** Staff member's first name */
  firstName: string;
  /** Staff member's last name */
  lastName: string;
  /** Contact email address */
  email: string | null;
  /** Contact phone number */
  phone: string | null;
  /** Filename of the staff member's avatar image */
  avatarFileName: string | null;
}
