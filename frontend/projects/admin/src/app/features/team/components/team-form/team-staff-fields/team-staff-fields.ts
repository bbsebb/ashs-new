import {Component, inject, input} from '@angular/core';
import {FieldTree, FormField} from '@angular/forms/signals';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatIcon} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {BreakpointService, FormFieldErrorDirective, PageTitle, RoleStaffPipe} from '@shared-ui';
import {STAFF_ROLE_VALUE} from '@shared-domain';
import {FormDeleteButton} from '../../../../../shared/form-delete-button/form-delete-button';
import {TeamFormService} from '../../../services/team-form.service';
import {TeamFormModel} from '../../../services/team.dtos';

@Component({
  selector: 'app-team-staff-fields',
  imports: [
    FormField,
    MatFormFieldModule,
    MatSelectModule,
    MatIcon,
    MatButtonModule,
    FormFieldErrorDirective,
    PageTitle,
    RoleStaffPipe,
    FormDeleteButton
  ],
  templateUrl: './team-staff-fields.html',
  styleUrl: './team-staff-fields.scss'
})
export class TeamStaffFields {
  private readonly _breakpointService = inject(BreakpointService);
  protected readonly teamFormService = inject(TeamFormService);

  staffsArray = input.required<FieldTree<TeamFormModel['staffs']>>();
  staffsSignal = this.teamFormService.staffsSignal;
  isHandsetSignal = this._breakpointService.isHandsetSignal;
  staffRoles = Object.values(STAFF_ROLE_VALUE);
}
