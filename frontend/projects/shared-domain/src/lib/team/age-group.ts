/**
 * Represents an age group category for teams (e.g., U13, Senior).
 */
export interface AgeGroup {
  /** Unique identifier for the age group */
  id: string;
  /** Maximum age for this group */
  ageLimit: number;
  /** Whether the age limit is an upper limit (true) or lower limit (false) */
  upperLimit: boolean;
  /** Display name of the age group */
  name: string;
}
