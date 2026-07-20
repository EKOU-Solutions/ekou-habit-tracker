import { Platform } from 'react-native';

import { matchEmojis } from '@/lib/emojiMatch';

/**
 * Generación de iconos "todo vive en tu iPhone", sin backend ni API keys:
 * 1) Apple Foundation Models (Apple Intelligence, on-device) cuando el dispositivo lo soporta
 *    — iOS 26+, iPhone 15 Pro o más nuevo, vía react-native-apple-llm.
 * 2) Fallback local instantáneo en cualquier dispositivo: matching semántico por etiquetas
 *    CLDR en español (src/lib/emojiMatch.ts).
 */
export interface IconRequest {
  query: string;
  exclude?: string[];
  count?: number;
}

const EMOJI_RE = /\p{Extended_Pictographic}/u;
const APPLE_TIMEOUT_MS = 12_000;

export async function proposeIcons({ query, exclude = [], count = 4 }: IconRequest): Promise<string[]> {
  const fromApple = await appleIcons(query, exclude, count);
  if (fromApple.length >= count) return fromApple.slice(0, count);
  const local = matchEmojis(query, [...exclude, ...fromApple], count - fromApple.length);
  return [...fromApple, ...local];
}

async function appleIcons(query: string, exclude: string[], count: number): Promise<string[]> {
  if (Platform.OS !== 'ios') return [];
  try {
    // require dinámico: el módulo nativo no existe en web y no debe evaluarse ahí.
    const llm = require('react-native-apple-llm') as typeof import('react-native-apple-llm');
    if ((await llm.isFoundationModelsEnabled()) !== 'available') return [];

    await llm.configureSession({
      instructions:
        'Eliges emojis que representen hábitos personales. Respondes únicamente con un emoji por campo, sin texto.',
    });
    // El schema del framework no soporta arrays: un campo string por propuesta.
    const structure = Object.fromEntries(
      Array.from({ length: count }, (_, i) => [
        `icon${i + 1}`,
        { type: 'string' as const, description: `Emoji ${i + 1}, distinto de los demás` },
      ]),
    );
    const avoid = exclude.length > 0 ? ` No uses estos: ${exclude.join(' ')}.` : '';
    const result = await withTimeout(
      llm.generateStructuredOutput({
        structure,
        prompt: `Propón ${count} emojis distintos que representen el hábito «${query}».${avoid}`,
      }),
      APPLE_TIMEOUT_MS,
    );

    const icons = Object.values(result ?? {})
      .filter((v): v is string => typeof v === 'string')
      .map((v) => v.trim())
      .filter((v) => v.length > 0 && v.length <= 8 && EMOJI_RE.test(v) && !exclude.includes(v));
    return [...new Set(icons)];
  } catch {
    return [];
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}
