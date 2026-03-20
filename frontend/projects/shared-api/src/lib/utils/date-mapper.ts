// On garde cette fonction privée pour ce fichier
function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Format "YYYY-MM-DD" (Ex: pour un LocalDate en backend)
 * Amélioration : Tolère null/undefined en entrée.
 */
export function dateToYyyyMmDd(date: Date | null | undefined): string | null {
  if (!date) return null; // Sécurité vitale pour les formulaires Angular

  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());

  return `${y}-${m}-${d}`;
}

/**
 * Format "DD-MM-YYYY" (Ex: pour un affichage personnalisé)
 */
export function dateToDdMmYyyy(date: Date | null | undefined): string | null {
  if (!date) return null;

  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());

  return `${d}-${m}-${y}`;
}

/**
 * NOUVEAU : Format "YYYY-MM-DDTHH:mm:ss"
 * Idéal pour envoyer tes données formées par le mat-timepicker vers un LocalDateTime
 */
export function dateToLocalDateTime(date: Date): string {


  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${hours}:${minutes}:${seconds}`;
}

/**
 * NOUVEAU : Parsing inverse (Backend vers Frontend)
 * Transforme le string reçu du backend en véritable objet Date pour tes composants Angular
 */
export function parseLocalDateTime(timeString: string): Date {
  // On découpe la chaîne "HH:mm:ss"
  const parts = timeString.split(':');
  if (parts.length < 2) {
    throw new Error('Invalid time format');
  }

  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  // Si le backend n'envoie pas les secondes, on met 0 par défaut
  const seconds = parts.length === 3 ? parseInt(parts[2], 10) : 0;

  // On crée une date du jour, et on écrase l'heure avec celle du backend
  const date = new Date();
  date.setHours(hours, minutes, seconds, 0);
  return date;
}
