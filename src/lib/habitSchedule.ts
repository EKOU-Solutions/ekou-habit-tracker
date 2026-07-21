import { DAY_LETTERS } from '@/lib/dates';

export type Frecuencia = 'diario' | 'semana' | 'dias';
export type Momento = 'manana' | 'tarde' | 'noche';

export const FRECUENCIA_LABELS: Record<Frecuencia, string> = {
  diario: 'Todos los días',
  semana: 'Entre semana',
  dias: 'Días elegidos',
};

/** Texto corto del segmento (4b); el label largo de arriba va en scheduleLabel. */
export const FRECUENCIA_SEGMENTS: { id: Frecuencia; label: string }[] = [
  { id: 'diario', label: 'Todos' },
  { id: 'semana', label: 'Entre semana' },
  { id: 'dias', label: 'Elegir días' },
];

export const MOMENTOS: { id: Momento; emoji: string; label: string; reminder: string }[] = [
  { id: 'manana', emoji: '☀️', label: 'Mañana', reminder: '08:00 · sugerido para la mañana' },
  { id: 'tarde', emoji: '🌤️', label: 'Tarde', reminder: '15:00 · sugerido para la tarde' },
  { id: 'noche', emoji: '🌙', label: 'Noche', reminder: '21:00 · sugerido para la noche' },
];

/** Días en orden L–D, no en orden de pulsación. */
export function daysInWeekOrder(days: string[]): string[] {
  return DAY_LETTERS.filter((d) => days.includes(d));
}

/** Etiqueta que ve el usuario en la lista: "Entre semana · mañana", "L · X · V", etc. */
export function buildScheduleLabel(
  frecuencia: Frecuencia | null,
  days: string[],
  momento: Momento | null,
): string {
  const ordered = daysInWeekOrder(days);
  const parts = [
    frecuencia === 'dias' && ordered.length > 0
      ? ordered.join(' · ')
      : FRECUENCIA_LABELS[frecuencia ?? 'diario'],
    momento ? MOMENTOS.find((m) => m.id === momento)?.label.toLowerCase() : null,
  ].filter(Boolean);
  return parts.join(' · ');
}
