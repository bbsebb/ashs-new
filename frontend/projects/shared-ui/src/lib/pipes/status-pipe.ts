import {Pipe, PipeTransform} from '@angular/core';

/**
 * Pipe translating domain status codes into French human-readable labels.
 */
@Pipe({
  name: 'status',
})
export class StatusPipe implements PipeTransform {
  private readonly statusMap: Record<string, string> = {
    'PENDING': 'En attente',
    'PROCESSED': 'Traité',
    'FAILED': 'Échoué',
    'PAID': 'Payé',
    'PAYED': 'Payé',
    'VALID': 'Valide',
    'DRAFT': 'Brouillon',
    'ACTIVE': 'Actif',
    'CLOSED': 'Fermé'
  };

  /**
   * Transforms a technical status string into French.
   * @param value The technical status value.
   * @returns Translated status or original string.
   */
  transform(value: string | undefined | null): string {
    if (!value) return '';
    const upperValue = value.toUpperCase();
    return this.statusMap[upperValue] ?? value;
  }
}
