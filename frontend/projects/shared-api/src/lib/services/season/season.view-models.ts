/**
 * View Model for the Season Card component.
 */
export interface SeasonCardViewModel {
  /** The unique identifier of the season. */
  id: string;
  /** The name of the season (e.g., "2024-2025"). */
  name: string;
  /** The start date of the season. */
  startDate: Date;
  /** The end date of the season. */
  endDate: Date;
  /** Whether the season is currently active. */
  isActive: boolean;
  /** Whether the season is the current ongoing one. */
  isCurrent: boolean;
}
