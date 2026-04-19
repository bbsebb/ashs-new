import {Staff} from '@shared-domain';

/** DTO for creating a new staff member. */
export type CreateStaffDTO = Omit<Staff, 'id' | 'avatarFileName'>;
/** DTO for updating a staff member. */
export type UpdateStaffDTO = Omit<Staff, 'id' | 'avatarFileName'> & {
  /** Optional current avatar filename. */
  avatarFileName?: Staff['avatarFileName'];
};
