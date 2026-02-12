import {Season} from '@shared-domain';

export type CreateSeasonDTO = Omit<Season, 'id'>
