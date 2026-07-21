import { matchEmojis } from '@/lib/emojiMatch';

import { androidProvider } from './android';
import { appleProvider } from './apple';
import type { IconProvider, IconRequest } from './types';

export type { IconRequest } from './types';

// Proveedores de IA on-device en orden de preferencia. El matcher local (respaldo
// universal, funciona en cualquier plataforma offline) completa lo que falte.
const AI_PROVIDERS: IconProvider[] = [appleProvider, androidProvider];

/**
 * Propone `count` emojis para un hábito: primero la IA on-device disponible en el dispositivo,
 * luego el matcher local en español, sin repetir ni incluir los `exclude`.
 */
export async function proposeIcons({ query, exclude = [], count = 4 }: IconRequest): Promise<string[]> {
  const picked: string[] = [];

  for (const provider of AI_PROVIDERS) {
    if (picked.length >= count) break;
    if (!(await provider.isAvailable())) continue;
    const proposed = await provider.propose({
      query,
      exclude: [...exclude, ...picked],
      count: count - picked.length,
    });
    for (const icon of proposed) {
      if (!picked.includes(icon)) picked.push(icon);
    }
  }

  if (picked.length >= count) return picked.slice(0, count);
  const local = matchEmojis(query, [...exclude, ...picked], count - picked.length);
  return [...picked, ...local];
}
