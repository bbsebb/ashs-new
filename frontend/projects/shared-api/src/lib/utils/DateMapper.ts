function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function dateToYyyyMmDd(date: Date): string {
  const y = date.getFullYear();
  const m = pad2(date.getMonth() + 1);
  const d = pad2(date.getDate());
  return `${y}-${m}-${d}`;
}
