import {Pipe, PipeTransform} from '@angular/core';
import {Gender} from '@shared-domain';

@Pipe({
  name: 'gender',
})
export class GenderPipe implements PipeTransform {

  transform(value: Gender, ...args: unknown[]): string {
    switch (value) {
      case 'Male':
        return 'Homme';
      case 'Female':
        return 'Femme';
      case 'Mixte':
        return 'Mixte';

    }
  }

}
