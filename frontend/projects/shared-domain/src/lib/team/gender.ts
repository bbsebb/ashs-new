/**
 * Available gender categories for teams.
 */
export const GENDER = ['Female', 'Male', 'Mixte'] as const;

/**
 * Type representing a team gender category.
 */
export type Gender = typeof GENDER[number];
