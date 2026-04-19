import {Pipe, PipeTransform} from '@angular/core';
import {DayOfWeek} from '@shared-domain';

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
   * @returns French day name (Lundi, etc.).
   */
  transform(value: DayOfWeek, ...args: unknown[]): string {
    switch (value) {
      case 'MONDAY':
        return 'Lundi';
      case 'TUESDAY':
        return 'Mardi';
      case 'WEDNESDAY':
        return 'Mercredi';
      case 'THURSDAY':
        return 'Jeudi';
      case 'FRIDAY':
        return 'Vendredi';
      case 'SATURDAY':
        return 'Samedi';
      case 'SUNDAY':
        return 'Dimanche';
    }
  }

}
