import {Pipe, PipeTransform} from '@angular/core';
import {DayOfWeek} from '@shared-domain';
import {formatDayOfWeek} from '@shared-api';

/**
 * Translates a DayOfWeek enum value to its French string representation.
 */
@Pipe({
  name: 'dayOfWeek',
})
export class DayOfWeekPipe implements PipeTransform {

  /**
   * Transforms a DayOfWeek technical value.
   * @param value Technical day name (MONDAY, etc.).
   * @param args
   * @returns French day name (Lundi, etc.).
   */
  transform(value: DayOfWeek, ...args: unknown[]): string {
    return formatDayOfWeek(value);
  }

}
