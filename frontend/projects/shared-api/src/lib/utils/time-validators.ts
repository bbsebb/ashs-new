/**
 * Validates that the end time is strictly after the start time.
 * @param context The validation context.
 * @param fields The fields to validate (should have startTime and endTime).
 * @returns An array of errors or null if valid.
 */
export function validateTimeRange(
  context: any,
  fields: any
) {
  const startTime = context.valueOf(fields.startTime);
  const endTime = context.valueOf(fields.endTime);

  if (startTime && endTime) {
    const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
    const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();

    if (startMinutes >= endMinutes) {
      const error = {
        kind: 'error',
        message: "L'heure de fin doit être supérieure à l'heure de début",
      };

      return [
        {...error, fieldTree: fields.startTime},
        {...error, fieldTree: fields.endTime}
      ];
    }
  }

  return null;
}
