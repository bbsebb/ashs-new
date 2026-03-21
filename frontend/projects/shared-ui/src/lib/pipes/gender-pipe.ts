import {Pipe, PipeTransform} from '@angular/core';
import {Gender} from '@shared-domain';

@Pipe({
  name: 'gender',
})
export class GenderPipe implements PipeTransform {

  transform(value: Gender, format: 'short' | 'long' = 'short'): string {
    switch (value) {
      case 'Male':
        return format === 'short' ? 'Masc.' : 'Masculin';
      case 'Female':
        return format === 'short' ? 'Fém.' : 'Feminin';
      case 'Mixte':
        return format === 'short' ? 'Mixte' : 'Mixte';
    }
  }

}
