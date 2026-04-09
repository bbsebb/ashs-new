export const GENDER = ['Female', 'Male', 'Mixte'] as const;
export type Gender = typeof GENDER[number];
