import {Pipe, PipeTransform} from '@angular/core';
import {formatCategory} from '@shared-api';

/**
 * Formats age group limits into team category labels (e.g., "-18 ans" or "Sénior").
 */
@Pipe({
  name: 'category',
  standalone: true
})
export class CategoryPipe implements PipeTransform {
  /**
   * Transforms age limit data into a category label.
   * @param ageLimit Numeric limit.
   * @param upperLimit True for "Moins de" (under), false for seniors/unlimited.
   * @param format 'short' (e.g. -18) or 'long' (e.g. Moins de 18 ans).
   * @returns Formatted category string.
   */
  transform(ageLimit: number, upperLimit: boolean, format: 'short' | 'long' = 'short'): string {
    return formatCategory(ageLimit, upperLimit, format);
  }
}
