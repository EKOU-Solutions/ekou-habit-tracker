/**
 * Duración del hábito a partir de su `timerLabel`. Conviven dos formatos: el del kit de inicio
 * ("20:00" = mm:ss) y el que produce el dictado por voz ("10 min", "1 h").
 * Devuelve null si la etiqueta no expresa una duración usable.
 */
export function parseTimerSeconds(label: string | undefined): number | null {
  if (!label) return null;
  const text = label.trim().toLowerCase();

  const clock = text.match(/^(\d{1,2}):(\d{2})$/);
  if (clock) {
    const total = Number(clock[1]) * 60 + Number(clock[2]);
    return total > 0 ? total : null;
  }

  const hours = text.match(/^(\d{1,2})\s*(h|hora|horas|hrs?)$/);
  if (hours) return Number(hours[1]) * 3600;

  const minutes = text.match(/^(\d{1,3})\s*(m|min|mins|minuto|minutos)$/);
  if (minutes) return Number(minutes[1]) * 60;

  return null;
}

/** Cuenta atrás como mm:ss (o h:mm:ss si pasa de una hora). */
export function formatCountdown(totalSeconds: number): string {
  const safe = Math.max(0, Math.ceil(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}
