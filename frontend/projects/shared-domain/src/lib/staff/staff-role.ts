/**
 * List of possible roles for staff members within a team.
 */
export const STAFF_ROLE_VALUE = ['COACH', 'ASSISTANT', 'SUPPORT'] as const;

/**
 * Type representing a specific staff role.
 */
export type StaffRoleValue = typeof STAFF_ROLE_VALUE[number];
