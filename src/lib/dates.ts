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
