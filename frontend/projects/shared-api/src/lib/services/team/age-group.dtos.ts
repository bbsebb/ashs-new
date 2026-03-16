import {AgeGroup} from '@shared-domain';

export type CreateAgeGroupDTO = Omit<AgeGroup, 'id' | 'name'>;
export type UpdateAgeGroupDTO = CreateAgeGroupDTO;
