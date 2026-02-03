import {Hall} from '../../../../../shared-domain/src/lib/hall/models/hall';


export type CreateHallDTO = Omit<Hall, 'id'>;
