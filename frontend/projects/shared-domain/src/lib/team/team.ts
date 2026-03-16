import {AgeGroup} from './age-group';

export enum Gender {
  Female = 'Female',
  Male = 'Male',
  Mixte = 'Mixte'
}


export interface Team {
  id: string;
  seasonId: string;
  gender: Gender;
  teamNumber: number;
  ageGroup: AgeGroup;
}
