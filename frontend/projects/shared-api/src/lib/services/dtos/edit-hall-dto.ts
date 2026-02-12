import {Hall} from '@shared-domain';

export type EditHallDTO = Omit<Hall, 'id'>
