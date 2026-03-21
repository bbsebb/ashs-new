import {Staff} from '@shared-domain';

export type CreateStaffDTO = Omit<Staff, 'id' | 'avatarFileName'>;
export type UpdateStaffDTO = Omit<Staff, 'id' | 'avatarFileName'> & {
  avatarFileName?: Staff['avatarFileName'];
};
