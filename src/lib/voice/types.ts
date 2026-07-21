import type { Frecuencia, Momento } from '@/lib/habitSchedule';

/** Hábito interpretado desde el dictado, antes de asignarle ícono. */
export interface ParsedHabit {
  name: string;
  frequency: Frecuencia;
  days: string[];
  moment: Momento | null;
  /** Duración leída ("10 min"), va al chip de temporizador. */
  timerLabel?: string;
  reminder: boolean;
}

/** Un motor de interpretación de voz; se prueban en orden hasta que uno devuelve resultado. */
export interface HabitParser {
  readonly id: string;
  /** Devuelve el hábito interpretado, o null si no está disponible / no pudo. */
  parse(transcript: string): Promise<ParsedHabit | null>;
}
