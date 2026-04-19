import {AgeGroup} from '@shared-domain';

/** DTO for creating a new age group. */
export type CreateAgeGroupDTO = Omit<AgeGroup, 'id' | 'name'>;
/** DTO for updating an existing age group. */
export type UpdateAgeGroupDTO = CreateAgeGroupDTO;
