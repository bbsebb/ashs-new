/**
 * Linkable item displaying training session details (day, time, hall).
 */
import {Component, input} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {DatePipe} from '@angular/common';
import {DayOfWeekPipe} from '../pipes';
import {DayOfWeek} from '@shared-domain';

@Component({
  selector: 'lib-training-session-item',
  standalone: true,
  imports: [RouterLink, MatIconModule, DatePipe, DayOfWeekPipe],
  templateUrl: './training-session-item.html',
  styleUrl: './training-session-item.scss'
})
export class TrainingSessionItem {
  dayOfWeekInputSignal = input.required<DayOfWeek>({alias: 'dayOfWeek'});
  startTimeInputSignal = input.required<Date>({alias: 'startTime'});
  endTimeInputSignal = input.required<Date>({alias: 'endTime'});
  hallNameInputSignal = input.required<string>({alias: 'hallName'});
  hallIdInputSignal = input.required<string>({alias: 'hallId'});
}
