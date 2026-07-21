import { Platform } from 'react-native';

import { isEmoji, withTimeout } from './shared';
import type { IconProvider } from './types';

const TIMEOUT_MS = 12_000;

/** Apple Foundation Models (Apple Intelligence, on-device): iOS 26+ y iPhone 15 Pro o más nuevo. */
export const appleProvider: IconProvider = {
  id: 'apple-foundation-models',

  async isAvailable() {
    if (Platform.OS !== 'ios') return false;
    try {
      return (await loadModule().isFoundationModelsEnabled()) === 'available';
    } catch {
      return false;
    }
  },

  async propose({ query, exclude, count }) {
    try {
      const llm = loadModule();
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
        TIMEOUT_MS,
      );

      const icons = Object.values(result ?? {})
        .filter((v): v is string => typeof v === 'string')
        .map((v) => v.trim())
        .filter((v) => isEmoji(v) && !exclude.includes(v));
      return [...new Set(icons)];
    } catch {
      return [];
    }
  },
};

// require dinámico: el módulo nativo no existe en web/Android y no debe evaluarse ahí.
function loadModule() {
  return require('react-native-apple-llm') as typeof import('react-native-apple-llm');
}
