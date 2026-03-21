import {Pipe, PipeTransform} from '@angular/core';
import {StaffRoleValue} from '@shared-domain';

@Pipe({
  name: 'roleStaff',
})
export class RoleStaffPipe implements PipeTransform {

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
