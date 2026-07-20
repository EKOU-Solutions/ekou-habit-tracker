import EMOJIS_ES from '@/data/emojisEs.json';

/**
 * Buscador local de emojis en español. El dataset (src/data/emojisEs.json) es un recorte de
 * emojibase-data/es/compact.json v17 (MIT, anotaciones oficiales de Unicode CLDR): etiquetas y
 * tags en español por emoji, sin banderas ni componentes. Funciona 100% offline en cualquier
 * dispositivo y es el fallback cuando Apple Intelligence no está disponible.
 */
interface EmojiEntry {
  /** carácter emoji */
  e: string;
  /** etiqueta CLDR en español */
  l: string;
  /** tags de búsqueda CLDR en español */
  t: string[];
  /** orden Unicode: menor = más común, usado como desempate */
  o: number;
}

interface IndexedEmoji extends EmojiEntry {
  labelTokens: string[];
  tagTokens: string[];
}

const STOPWORDS = new Set([
  'de', 'del', 'la', 'el', 'los', 'las', 'un', 'una', 'unos', 'unas', 'y', 'o', 'a', 'al',
  'en', 'con', 'sin', 'por', 'para', 'mi', 'mis', 'tu', 'tus', 'me', 'te', 'se', 'que',
  'cada', 'todos', 'todas', 'dia', 'dias', 'vez', 'veces', 'min', 'mins', 'minutos', 'hora',
  'horas', 'hacer', 'mas', 'antes', 'despues', 'durante',
]);

export const FALLBACK_ICONS = ['✨', '🌱', '💪', '🎯', '⭐', '🔥', '🧠', '🌊'];

// Vocabulario de hábitos que las anotaciones CLDR no cubren como tag (p. ej. no existe
// el tag "leer"): cada término expande la búsqueda hacia tags que sí existen.
const ALIASES: Record<string, string[]> = {
  leer: ['libro'],
  lectura: ['libro'],
  estudiar: ['libro', 'birrete'],
  tomar: ['bebida', 'vaso'],
  beber: ['bebida', 'vaso'],
  ejercicio: ['pesas', 'deporte', 'músculo'],
  gimnasio: ['pesas', 'músculo'],
  gym: ['pesas'],
  entrenar: ['pesas', 'deporte'],
  dormir: ['cama', 'sueño'],
  descansar: ['cama', 'sueño'],
  escribir: ['lápiz', 'pluma', 'cuaderno'],
  diario: ['cuaderno'],
  dibujar: ['pintar', 'arte', 'lápiz'],
  cocinar: ['comida', 'sartén'],
  rezar: ['orar'],
  nadar: ['natación', 'nadador'],
  bici: ['bicicleta'],
  pedalear: ['bicicleta'],
  estirar: ['gimnasia', 'yoga'],
  vitaminas: ['píldora'],
  medicina: ['píldora'],
  ahorrar: ['dinero', 'hucha'],
  pasear: ['caminar', 'andar'],
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

function tokenize(text: string): string[] {
  return normalize(text)
    .split(/[^a-zñ0-9]+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

/** Sin selectores de variación (FE0F), para comparar emojis de distintas fuentes. */
function canon(emoji: string): string {
  return emoji.replace(/️/g, '');
}

let index: IndexedEmoji[] | null = null;

function getIndex(): IndexedEmoji[] {
  index ??= (EMOJIS_ES as EmojiEntry[]).map((entry) => ({
    ...entry,
    labelTokens: tokenize(entry.l),
    tagTokens: entry.t.map(normalize),
  }));
  return index;
}

function sharedPrefix(a: string, b: string): number {
  const max = Math.min(a.length, b.length);
  let i = 0;
  while (i < max && a[i] === b[i]) i++;
  return i;
}

function expandTokens(tokens: string[]): string[] {
  const expanded = [...tokens];
  for (const token of tokens) {
    const aliases = ALIASES[token];
    if (aliases) expanded.push(...aliases.map(normalize));
  }
  return [...new Set(expanded)];
}

function score(entry: IndexedEmoji, tokens: string[]): number {
  let total = 0;
  let matched = 0;
  for (const token of tokens) {
    // Acumulativo: tag y etiqueta suman juntos para que "agua potable" (tag + etiqueta)
    // gane sobre matches solo-tag como waterpolo.
    let hit = 0;
    if (entry.tagTokens.includes(token)) hit += 4;
    if (entry.labelTokens.includes(token)) hit += 3;
    if (hit === 0) {
      // Raíz compartida graduada: "meditar" ↔ "meditacion" (6 letras) pesa más
      // que coincidencias cortas tipo "medi" ↔ "medico".
      const best = Math.max(
        0,
        ...[...entry.tagTokens, ...entry.labelTokens].map((w) => sharedPrefix(w, token)),
      );
      if (best >= 6) hit = 3;
      else if (best >= 4) hit = 2;
    }
    if (hit > 0) matched++;
    total += hit;
  }
  // Cubrir más palabras de la consulta vale más que repetir una sola.
  return matched > 1 ? total + 2 * (matched - 1) : total;
}

/** Los `count` emojis que mejor matchean el texto, excluyendo los ya mostrados. */
export function matchEmojis(query: string, exclude: string[] = [], count = 4): string[] {
  const tokens = expandTokens(tokenize(query));
  const excluded = new Set(exclude.map(canon));
  const picked: string[] = [];

  if (tokens.length > 0) {
    const ranked = getIndex()
      .map((entry) => ({ entry, s: score(entry, tokens) }))
      .filter(({ entry, s }) => s > 0 && !excluded.has(canon(entry.e)))
      .sort((a, b) => b.s - a.s || a.entry.o - b.entry.o);
    // Dos pasadas: primero conceptos distintos — las variantes de género/persona son
    // secuencias ZWJ del mismo emoji base (🧘/🧘‍♂️/🧘‍♀️) — y luego se rellena con lo que quede.
    const usedConcepts = new Set<string>();
    for (const diversify of [true, false]) {
      for (const { entry } of ranked) {
        if (picked.length >= count) break;
        if (excluded.has(canon(entry.e))) continue;
        const concept = canon(entry.e).split('‍')[0];
        if (diversify && usedConcepts.has(concept)) continue;
        usedConcepts.add(concept);
        picked.push(entry.e);
        excluded.add(canon(entry.e));
      }
    }
  }

  for (const icon of FALLBACK_ICONS) {
    if (picked.length >= count) break;
    if (!excluded.has(canon(icon))) {
      picked.push(icon);
      excluded.add(canon(icon));
    }
  }
  return picked;
}
