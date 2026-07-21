import { buildScheduleLabel } from '@/lib/habitSchedule';
import { proposeIcons } from '@/lib/icons';

import { appleParser } from './apple';
import { localParse } from './local';
import type { HabitParser, ParsedHabit } from './types';

export type { ParsedHabit } from './types';

/** Hábito interpretado listo para la preview: config + etiqueta + ícono. */
export interface VoiceHabit extends ParsedHabit {
  icon: string;
  scheduleLabel: string;
}

// Motores de interpretación en orden de preferencia; el parser local siempre resuelve.
const PARSERS: HabitParser[] = [appleParser];

/** Convierte el dictado en un hábito completo: interpreta la config y le asigna un ícono. */
export async function interpretSpokenHabit(transcript: string): Promise<VoiceHabit> {
  let parsed: ParsedHabit | null = null;
  for (const parser of PARSERS) {
    parsed = await parser.parse(transcript);
    if (parsed) break;
  }
  parsed ??= localParse(transcript);

  const [icon] = await proposeIcons({ query: parsed.name, count: 1 });
  return {
    ...parsed,
    icon: icon ?? '✨',
    scheduleLabel: buildScheduleLabel(parsed.frequency, parsed.days, parsed.moment),
  };
}
