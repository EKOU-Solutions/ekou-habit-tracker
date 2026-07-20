export const DAY_LETTERS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'] as const;

/** "domingo 19 de julio" (es, sin coma). */
export function formatDayMonth(date: Date): string {
  return new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long' })
    .format(date)
    .replace(',', '');
}

export function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Clave local YYYY-MM-DD: el día de un hábito es el del dispositivo, no UTC. */
export function toDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}
