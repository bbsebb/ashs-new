import {Pipe, PipeTransform} from '@angular/core';
import {Gender} from '@shared-domain';

/**
 * Formats a Gender value into a human-readable string.
 * Supports short (e.g., "Masc.") and long (e.g., "Masculin") formats.
 */
@Pipe({
  name: 'gender',
})
export class GenderPipe implements PipeTransform {

  /**
   * Transforms a technical Gender value.
   * @param value The gender from the domain model.
   * @param format 'short' or 'long'. Defaults to 'short'.
   * @returns Formatted string.
   */
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
