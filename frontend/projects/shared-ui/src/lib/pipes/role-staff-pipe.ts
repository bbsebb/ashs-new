import {Pipe, PipeTransform} from '@angular/core';
import {StaffRoleValue} from '@shared-domain';
import {formatStaffRole} from '@shared-api';

/**
 * Translates a StaffRoleValue enum to its French label.
 */
@Pipe({
  name: 'roleStaff',
})
export class RoleStaffPipe implements PipeTransform {

  /**
   * Transforms a technical staff role.
   * @param value The role (COACH, SUPPORT, etc.).
   * @param args
   * @returns French descriptive label.
   */
  transform(value: StaffRoleValue, ...args: unknown[]): string {
    return formatStaffRole(value);
  }

}
