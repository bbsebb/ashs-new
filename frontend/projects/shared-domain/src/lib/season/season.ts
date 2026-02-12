import {UUID} from '../uuid';

export interface Season {
  id: UUID;
  startDate: Date;
  endDate: Date;
  name: string;
  isCurrent: boolean;
  isActive: boolean;
}
