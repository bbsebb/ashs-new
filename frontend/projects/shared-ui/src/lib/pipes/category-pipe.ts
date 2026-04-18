import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'category',
  standalone: true
})
export class CategoryPipe implements PipeTransform {
  transform(ageLimit: number, upperLimit: boolean, format: 'short' | 'long' = 'short'): string {
    if (format === 'long') {
      return upperLimit ? `Moins de ${ageLimit} ans` : 'Sénior';
    }

    return upperLimit ? `-${ageLimit} ans` : `+${ageLimit} ans`;
  }
}
