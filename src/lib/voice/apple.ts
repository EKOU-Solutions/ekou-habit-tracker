import { Platform } from 'react-native';

import { DAY_LETTERS } from '@/lib/dates';
import type { Frecuencia, Momento } from '@/lib/habitSchedule';

import { localParse } from './local';
import type { HabitParser, ParsedHabit } from './types';

const TIMEOUT_MS = 12_000;
const FREQS: Frecuencia[] = ['diario', 'semana', 'dias'];
const MOMENTS: Momento[] = ['manana', 'tarde', 'noche'];

/** Interpretación del dictado con Apple Foundation Models (on-device, iOS 26+ con Apple Intelligence). */
export const appleParser: HabitParser = {
  id: 'apple-foundation-models',

  async parse(transcript) {
    if (Platform.OS !== 'ios') return null;
    try {
      const llm = require('react-native-apple-llm') as typeof import('react-native-apple-llm');
      if ((await llm.isFoundationModelsEnabled()) !== 'available') return null;

      await llm.configureSession({
        instructions:
          'Conviertes una frase hablada en español en la configuración de un hábito. Respondes solo con los campos pedidos.',
      });
      const result = await withTimeout(
        llm.generateStructuredOutput({
          structure: {
            name: { type: 'string', description: 'Nombre corto del hábito, sin la frecuencia ni la hora' },
            frequency: {
              type: 'string',
              enum: FREQS,
              description: 'diario = todos los días; semana = entre semana; dias = días concretos',
            },
            days: {
              type: 'string',
              description: 'Si frequency=dias, letras de los días en L,M,X,J,V,S,D separadas por coma; si no, vacío',
            },
            moment: { type: 'string', enum: [...MOMENTS, 'ninguno'], description: 'Momento del día o ninguno' },
            minutes: { type: 'integer', description: 'Duración en minutos si se menciona; si no, 0' },
          },
          prompt: `Interpreta este hábito dictado: «${transcript}».`,
        }),
        TIMEOUT_MS,
      );

      return coerce(result, transcript);
    } catch {
      return null;
    }
  },
};

function coerce(raw: unknown, transcript: string): ParsedHabit {
  const r = (raw ?? {}) as Record<string, unknown>;
  const fallback = localParse(transcript);

  const name = typeof r.name === 'string' && r.name.trim().length > 0 ? r.name.trim() : fallback.name;
  const frequency = FREQS.includes(r.frequency as Frecuencia) ? (r.frequency as Frecuencia) : fallback.frequency;
  const days =
    typeof r.days === 'string'
      ? r.days.toUpperCase().split(/[^LMXJVSD]+/).filter((d) => (DAY_LETTERS as readonly string[]).includes(d))
      : [];
  const moment = MOMENTS.includes(r.moment as Momento) ? (r.moment as Momento) : null;
  const minutes = typeof r.minutes === 'number' && r.minutes > 0 ? Math.round(r.minutes) : null;

  return {
    name,
    frequency,
    days: frequency === 'dias' ? (days.length > 0 ? days : fallback.days) : [],
    moment,
    timerLabel: minutes ? `${minutes} min` : fallback.timerLabel,
    reminder: fallback.reminder,
  };
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}
