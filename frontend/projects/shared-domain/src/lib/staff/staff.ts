import {UUID} from '../uuid';

export interface Staff {
  id: UUID;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  avatarFileName: string | null;
}
