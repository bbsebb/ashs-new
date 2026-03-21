import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ageLimit',
  standalone: true
})
export class AgeLimitPipe implements PipeTransform {
  transform(upperLimit: boolean, format: 'short' | 'long' = 'short'): string {
    if (format === 'long') {
      return upperLimit ? 'Moins de' : 'Plus de';
    }
    return upperLimit ? '-' : '+';
  }
}
