import {Hall} from '@shared-domain';

export type CreateHallDTO = Omit<Hall, 'id'>;
export type EditHallDTO = Omit<Hall, 'id'>;
