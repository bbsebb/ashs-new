import {Season} from '@shared-domain';

export type EditSeasonDTO = Omit<Season, 'id'>
