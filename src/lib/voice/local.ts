import { capitalizeFirst } from '@/lib/dates';
import type { Frecuencia, Momento } from '@/lib/habitSchedule';

import type { ParsedHabit } from './types';

/**
 * Parser local de reglas en español: extrae nombre + configuración de la frase dictada,
 * sin red ni modelo. Es el respaldo universal (cualquier iPhone y el futuro Android) cuando
 * Apple Intelligence no está disponible. Detecta frecuencia, días, momento y duración, y deja
 * como nombre lo que queda tras quitar muletillas y esas expresiones de configuración.
 */

// Muletillas de arranque: "ekou, quiero...", "recuérdame...", "necesito hacer...".
const FILLERS = [
  'ekou',
  'oye ekou',
  'hola ekou',
  'quiero',
  'quisiera',
  'me gustaria',
  'necesito',
  'recuerdame',
  'recuerda',
  'recordarme',
  'ayudame a',
  'voy a',
  'crear el habito de',
  'crear un habito de',
  'crear habito de',
  'el habito de',
  'un habito de',
  'habito de',
  'agrega',
  'agregar',
  'anade',
  'anadir',
  'apunta',
  'apuntar',
  'que',
  'de',
];

const DAY_WORDS: { re: RegExp; letter: string }[] = [
  { re: /\blunes\b/, letter: 'L' },
  { re: /\bmartes\b/, letter: 'M' },
  { re: /\bmi[eé]rcoles\b/, letter: 'X' },
  { re: /\bjueves\b/, letter: 'J' },
  { re: /\bviernes\b/, letter: 'V' },
  { re: /\bs[aá]bados?\b/, letter: 'S' },
  { re: /\bdomingos?\b/, letter: 'D' },
];

const MOMENT_WORDS: { re: RegExp; moment: Momento }[] = [
  { re: /\b(por|en|de|cada|a|todas?)?\s*(la|las)?\s*ma[ñn]anas?\b/, moment: 'manana' },
  { re: /\b(al|por|en|de|cada|a)?\s*(el|la)?\s*mediod[ií]a\b/, moment: 'tarde' },
  { re: /\b(por|en|de|cada|a|todas?)?\s*(la|las)?\s*tardes?\b/, moment: 'tarde' },
  { re: /\b(por|en|de|cada|a|todas?)?\s*(la|las)?\s*noches?\b/, moment: 'noche' },
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[.,;:!?¡¿]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectFrequency(text: string): { frequency: Frecuencia; days: string[]; strip: RegExp[] } {
  const strip: RegExp[] = [];
  const days: string[] = [];
  for (const { re, letter } of DAY_WORDS) {
    if (re.test(text)) {
      days.push(letter);
      strip.push(re);
    }
  }
  // Conectores entre días ("lunes y miércoles", "lunes, miércoles").
  if (days.length > 0) strip.push(/\b(y|los|el|cada)\b/g);

  // "diario" a secas se omite a propósito: choca con el sustantivo ("escribir mi diario").
  if (/\b(todos los dias|cada dia|a diario|diariamente)\b/.test(text)) {
    strip.push(/\b(todos los dias|cada dia|a diario|diariamente)\b/g);
    return { frequency: 'diario', days: [], strip };
  }
  if (/\b(entre semana|dias laborales?|de lunes a viernes|entre semanas)\b/.test(text)) {
    strip.push(/\b(entre semana|dias laborales?|de lunes a viernes)\b/g);
    return { frequency: 'semana', days: [], strip };
  }
  if (days.length > 0) return { frequency: 'dias', days, strip };
  // Sin señal de frecuencia: por defecto todos los días (guideline: con uno al día basta).
  return { frequency: 'diario', days: [], strip };
}

function detectMoment(text: string): { moment: Momento | null; strip: RegExp | null } {
  for (const { re, moment } of MOMENT_WORDS) {
    if (re.test(text)) return { moment, strip: re };
  }
  return { moment: null, strip: null };
}

function detectDuration(text: string): { timerLabel?: string; strip: RegExp | null } {
  const min = text.match(/\b(\d{1,3})\s*(minutos?|mins?|min)\b/);
  if (min) return { timerLabel: `${min[1]} min`, strip: /\b\d{1,3}\s*(minutos?|mins?|min)\b/ };
  const hr = text.match(/\b(\d{1,2})\s*(horas?|hrs?|h)\b/);
  if (hr) return { timerLabel: `${hr[1]} h`, strip: /\b\d{1,2}\s*(horas?|hrs?|h)\b/ };
  return { strip: null };
}

function stripLeadingFillers(text: string): string {
  let out = text;
  let changed = true;
  while (changed) {
    changed = false;
    for (const filler of FILLERS) {
      const prefix = filler + ' ';
      if (out.startsWith(prefix)) {
        out = out.slice(prefix.length);
        changed = true;
      }
    }
  }
  return out;
}

function cleanName(text: string, strips: RegExp[]): string {
  let out = text;
  for (const re of strips) out = out.replace(re, ' ');
  out = stripLeadingFillers(out.replace(/\s+/g, ' ').trim());
  // Preposiciones/conectores sueltos al inicio o final tras quitar config; en bucle porque
  // pueden encadenarse ("de a" → "de" → "").
  const edge = /^\s*(por|en|de|del|la|las|el|los|a|al|cada|y)\b|\b(por|en|de|del|la|las|el|los|a|al|cada|y|todos?|todas?)\b\s*$/gi;
  let prev: string;
  do {
    prev = out;
    out = out.replace(edge, '').replace(/\s+/g, ' ').trim();
  } while (out !== prev);
  return out;
}

export function localParse(transcript: string): ParsedHabit {
  const text = normalize(transcript);
  const { frequency, days, strip: freqStrip } = detectFrequency(text);
  const { moment, strip: momentStrip } = detectMoment(text);
  const { timerLabel, strip: durStrip } = detectDuration(text);

  const strips = [...freqStrip, momentStrip, durStrip].filter((r): r is RegExp => r !== null);
  let name = cleanName(text, strips);
  if (name.length === 0) name = stripLeadingFillers(text) || text;
  // Nombre acotado y con la primera en mayúscula, como en el resto del app.
  name = capitalizeFirst(name.split(' ').slice(0, 6).join(' '));

  const reminder = !/\b(sin recordatorio|no me recuerdes|sin alerta|sin aviso)\b/.test(text);

  return { name, frequency, days, moment, timerLabel, reminder };
}
