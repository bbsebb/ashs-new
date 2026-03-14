import {Staff} from '@shared-domain';

export type CreateStaffDTO = Omit<Staff, 'id' | 'fileName'>;
export type EditStaffDTO = Omit<Staff, 'id' | 'fileName'> & {
  fileName?: Staff['fileName'];
};
