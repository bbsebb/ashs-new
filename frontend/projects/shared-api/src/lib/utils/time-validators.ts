import {FieldTree} from '@angular/forms/signals';

/**
 * Validates that the end time is strictly after the start time.
 * @param context The validation context.
 * @returns An array of errors or null if valid.
 */
export function validateTimeRange(
  context: any
) {
  const startTime = context.valueOf(context.fieldTree.startTime);
  const endTime = context.valueOf(context.fieldTree.endTime);

  if (startTime && endTime) {
    const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
    const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();

    if (startMinutes >= endMinutes) {
      const error = {
        kind: 'error',
        message: "L'heure de fin doit être supérieure à l'heure de début",
      };

      return [
        {...error, fieldTree: context.fieldTree.startTime},
        {...error, fieldTree: context.fieldTree.endTime}
      ];
    }
  }

  return null;
}
