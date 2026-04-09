export const STAFF_ROLE_VALUE = ['COACH', 'ASSISTANT', 'SUPPORT'] as const;
export type StaffRoleValue = typeof STAFF_ROLE_VALUE[number];
