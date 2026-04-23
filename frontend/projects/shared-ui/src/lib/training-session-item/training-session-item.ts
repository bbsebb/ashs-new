import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {DatePipe} from '@angular/common';
import {DayOfWeekPipe} from '../pipes';
import {TeamTrainingSessionViewModel} from '@shared-api';

/**
 * Linkable item displaying training session details.
 * Purely presentational component using a ViewModel.
 */
@Component({
  selector: 'lib-training-session-item',
  standalone: true,
  imports: [RouterLink, MatIconModule, DatePipe, DayOfWeekPipe],
  templateUrl: './training-session-item.html',
  styleUrl: './training-session-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrainingSessionItem {
  /** The ViewModel containing session details. */
  trainingSessionViewModelInputSignal = input.required<TeamTrainingSessionViewModel>({alias: 'trainingSessionViewModel'});
}
