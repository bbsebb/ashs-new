import {DayOfWeek, Gender, StaffRoleValue} from '@shared-domain';

/**
 * Formats age group limits into team category labels.
 */
export function formatCategory(ageLimit: number, upperLimit: boolean, format: 'short' | 'long' = 'short'): string {
  if (format === 'long') {
    return upperLimit ? `Moins de ${ageLimit} ans` : 'Sénior';
  }
  return upperLimit ? `-${ageLimit} ans` : `+${ageLimit} ans`;
}

/**
 * Formats a Gender value into a human-readable string.
 */
export function formatGender(value: Gender, format: 'short' | 'long' = 'short'): string {
  switch (value) {
    case 'Male':
      return format === 'short' ? 'Masc.' : 'Masculin';
    case 'Female':
      return format === 'short' ? 'Fém.' : 'Feminin';
    case 'Mixte':
      return format === 'short' ? 'Mixte' : 'Mixte';
    default:
      return 'Mixte';
  }
}

/**
 * Translates a StaffRoleValue enum to its French label.
 */
export function formatStaffRole(value: StaffRoleValue): string {
  switch (value) {
    case 'COACH':
      return 'Entraineur';
    case 'SUPPORT':
      return 'Adjoint';
    case 'ASSISTANT':
      return 'Accompagnateur';
    default:
      return 'Accompagnateur';
  }
}

/**
 * Translates a DayOfWeek enum value to its French string representation.
 */
export function formatDayOfWeek(value: DayOfWeek): string {
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
    default:
      return 'Lundi';
  }
}
