/**
 * Pads a number with a leading zero if it is less than 10.
 * @param n The number to pad.
 * @returns A string representation of the padded number.
 */
function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Formats a Date object as a "YYYY-MM-DD" string.
 * This format is compatible with backend LocalDate.
 * @param date The date to format.
 * @returns A string in "YYYY-MM-DD" format, or null if input is null/undefined.
 */
export function dateToYyyyMmDd(date: Date | null | undefined): string | null {
  if (!date) return null;

  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());

  return `${y}-${m}-${d}`;
}

/**
 * Formats a Date object as a "DD-MM-YYYY" string for display purposes.
 * @param date The date to format.
 * @returns A string in "DD-MM-YYYY" format, or null if input is null/undefined.
 */
export function dateToDdMmYyyy(date: Date | null | undefined): string | null {
  if (!date) return null;

  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());

  return `${d}-${m}-${y}`;
}

/**
 * Formats a Date object's time as an "HH:mm:ss" string.
 * Useful for sending time data to backend LocalDateTime.
 * @param date The date containing the time to format.
 * @returns A string in "HH:mm:ss" format.
 */
export function dateToLocalDateTime(date: Date): string {
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Parses a time string ("HH:mm:ss") from the backend into a Javascript Date object.
 * The resulting Date object uses the current day with the specified time.
 * @param timeString The time string to parse.
 * @returns A Date object set to the specified time.
 */
export function parseLocalDateTime(timeString: string): Date {
  const parts = timeString.split(':');
  if (parts.length < 2) {
    throw new Error('Invalid time format');
  }

  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parts.length === 3 ? parseInt(parts[2], 10) : 0;

  const date = new Date();
  date.setHours(hours, minutes, seconds, 0);
  return date;
}
