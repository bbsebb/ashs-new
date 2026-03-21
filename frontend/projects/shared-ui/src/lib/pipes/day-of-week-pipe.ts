import {Pipe, PipeTransform} from '@angular/core';
import {DayOfWeek} from '@shared-domain';

@Pipe({
  name: 'dayOfWeek',
})
export class DayOfWeekPipe implements PipeTransform {

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
