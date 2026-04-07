import {DayOfWeek, Gender, StaffRoleValue} from '@shared-domain';

export interface TeamFormModel {
  seasonId: string;
  ageGroupId: string;
  gender: Gender;
  teamNumber: number;
  staffs: {
    id: string,
    role: StaffRoleValue,
    staffId: string
  }[],
  trainingSessions: {
    id: string;
    hallId: string;
    dayOfWeek: DayOfWeek;
    timeSlot: {
      startTime: Date,
      endTime: Date
    };
  }[]
}
