import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';
import { DayOfWeekPipe } from '../pipes/day-of-week-pipe';
import { DayOfWeek } from '@shared-domain';

@Component({
  selector: 'lib-training-session-item',
  standalone: true,
  imports: [RouterLink, MatIconModule, DatePipe, DayOfWeekPipe],
  templateUrl: './training-session-item.html',
  styleUrl: './training-session-item.scss'
})
export class TrainingSessionItem {
  dayOfWeek = input.required<DayOfWeek>();
  startTime = input.required<Date>();
  endTime = input.required<Date>();
  hallName = input.required<string>();
  hallId = input.required<string>();
}
