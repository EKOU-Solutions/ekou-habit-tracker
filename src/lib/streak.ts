import { parseDateKey, toDateKey } from '@/lib/dates';

export type HabitHistory = Record<string, string[]>;

/**
 * Racha viva: días consecutivos con ≥1 hábito hecho, contando hacia atrás desde hoy.
 * Hoy sin marcar todavía no la rompe (guideline: "la racha vive con ≥1 hábito al día"),
 * y recuperar un día pasado rellena el hueco y reconecta la corrida completa.
 */
export function currentStreak(history: HabitHistory, today = new Date()): number {
  const cursor = new Date(today);
  if (!hasDone(history, cursor)) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (hasDone(history, cursor)) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Mejor racha histórica: la corrida consecutiva más larga registrada. */
export function bestStreak(history: HabitHistory): number {
  const activeDays = Object.keys(history)
    .filter((key) => history[key].length > 0)
    .sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const key of activeDays) {
    run = prev !== null && isNextDay(prev, key) ? run + 1 : 1;
    best = Math.max(best, run);
    prev = key;
  }
  return best;
}

/** Primer día con actividad registrada, o null si aún no hay historial. */
export function firstActivityKey(history: HabitHistory): string | null {
  const keys = Object.keys(history).filter((key) => history[key].length > 0);
  return keys.length > 0 ? keys.sort()[0] : null;
}

function hasDone(history: HabitHistory, date: Date): boolean {
  return (history[toDateKey(date)]?.length ?? 0) > 0;
}

function isNextDay(prevKey: string, key: string): boolean {
  const next = parseDateKey(prevKey);
  next.setDate(next.getDate() + 1);
  return toDateKey(next) === key;
}
