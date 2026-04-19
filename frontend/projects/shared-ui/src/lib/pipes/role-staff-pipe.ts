import {Pipe, PipeTransform} from '@angular/core';
import {StaffRoleValue} from '@shared-domain';

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
   * @returns French descriptive label.
   */
  transform(value: StaffRoleValue, ...args: unknown[]): string {
    switch (value) {
      case 'COACH':
        return 'Entraineur';
      case 'SUPPORT':
        return 'Adjoint';
      case 'ASSISTANT':
        return 'Accompagnateur';
    }

  }

}
