import {Staff} from '@shared-domain';

export type CreateStaffDTO = Omit<Staff, 'id' | 'fileName'>;
export type UpdateStaffDTO = Omit<Staff, 'id' | 'fileName'> & {
  fileName?: Staff['fileName'];
};
