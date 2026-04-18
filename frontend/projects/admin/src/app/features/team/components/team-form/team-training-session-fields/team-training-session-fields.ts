import {Component, computed, inject, input} from '@angular/core';
import {FieldTree, FormField} from '@angular/forms/signals';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatIcon} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatTimepickerModule} from '@angular/material/timepicker';
import {BreakpointService, DayOfWeekPipe, FormFieldErrorDirective, PageTitle} from '@shared-ui';
import {DAY_OF_WEEKS} from '@shared-domain';
import {FormDeleteButton} from '../../../../../shared/form-delete-button/form-delete-button';
import {TeamFormService} from '../../../services/team-form.service';
import {TeamFormModel} from '../../../services/team.dtos';

@Component({
  selector: 'app-team-training-session-fields',
  imports: [
    FormField,
    MatFormFieldModule,
    MatSelectModule,
    MatIcon,
    MatButtonModule,
    MatInputModule,
    MatTimepickerModule,
    FormFieldErrorDirective,
    PageTitle,
    DayOfWeekPipe,
    FormDeleteButton
  ],
  templateUrl: './team-training-session-fields.html',
  styleUrl: './team-training-session-fields.scss'
})
export class TeamTrainingSessionFields {
  private readonly _breakpointService = inject(BreakpointService);
  protected readonly teamFormService = inject(TeamFormService);

  sessionsArray = input.required<FieldTree<TeamFormModel['trainingSessions']>>();

  // On aide IntelliJ en extrayant le signal dans une propriété explicite
  protected readonly sessionsSignal = computed(() => this.sessionsArray());

  hallsSignal = this.teamFormService.hallsSignal;
  isHandsetSignal = this._breakpointService.isHandsetSignal;
  dayOfWeeks = Object.values(DAY_OF_WEEKS);
}
