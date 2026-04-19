/** Base data for a season. */
export type SeasonDTO = {
  /** Start date of the season (ISO string). */
  startDate: string;
  /** End date of the season (ISO string). */
  endDate: string;
}

/** DTO for creating a season. */
export type CreateSeasonDTO = SeasonDTO;
/** DTO for updating a season. */
export type UpdateSeasonDTO = SeasonDTO;
