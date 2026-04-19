/**
 * Enumeration of the days of the week.
 */
export const DAY_OF_WEEKS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;

/**
 * Type representing a day of the week.
 */
export type DayOfWeek = typeof DAY_OF_WEEKS[number];
