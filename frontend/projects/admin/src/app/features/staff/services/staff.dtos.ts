import {Staff} from '@shared-domain';

export type StaffFormModel = Omit<Staff, 'id' | 'phone' | 'email' | 'avatarFileName'> & {
  phone: NonNullable<Staff['phone']>;
  email: NonNullable<Staff['email']>;
};
