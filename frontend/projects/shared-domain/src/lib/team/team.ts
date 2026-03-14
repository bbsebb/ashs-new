export enum Gender {
  Female = 'Female',
  Male = 'Male',
  Mixte = 'Mixte'
}

export interface AgeGroup {
  uuid: string;
  ageLimit: number;
  isUpperLimit: boolean;
}

export interface Team {
  id: string;
  seasonId: string;
  gender: Gender;
  teamNumber: number;
  ageGroup: AgeGroup;
}
