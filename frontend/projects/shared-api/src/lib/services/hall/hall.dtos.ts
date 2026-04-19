import {Hall} from '@shared-domain';

/** Data Transfer Object for creating a new Hall. */
export type CreateHallDTO = Omit<Hall, 'id'>;
/** Data Transfer Object for updating an existing Hall. */
export type UpdateHallDTO = Omit<Hall, 'id'>;
