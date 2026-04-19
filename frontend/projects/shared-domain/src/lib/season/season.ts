import {UUID} from '../uuid';

/**
 * Represents a sports season (e.g., "2024-2025").
 */
export interface Season {
  /** Unique identifier for the season. */
  id: UUID;
  /** The start date of the season. */
  startDate: Date;
  /** The end date of the season. */
  endDate: Date;
  /** The display name of the season. */
  name: string;
  /** Indicates if this is the currently ongoing season. */
  isCurrent: boolean;
  /** Indicates if this season is active (e.g., selected in the UI). */
  isActive: boolean;
}
