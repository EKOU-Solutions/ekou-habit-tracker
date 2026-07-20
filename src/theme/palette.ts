// Paleta EKOU (doc/ux-ui-guidelines.md §2); valores crudos para donde no aplican clases de Tailwind.
export const palette = {
  marino: '#001A70',
  aguamarina: '#2DCCD3',
  tealProfundo: '#0E7C81',
  morado: '#AF0F7D',
  ciruela: '#4B1268',
  blanco: '#FFFFFF',
  tinta: '#101C4D',
  moradoClaro: '#C265A4',
  anilloTrack: '#E9EBF4',
  anilloTrackRiesgo: '#F3E2ED',
  gris400: '#AAB0C6',
  gris350: '#B0B5C8',
  gris300: '#C3C8D9',
  gris250: '#E7E9F1',
  gris150: '#EDEFF6',
  gris100: '#F1F3FA',
  gris50: '#F8F9FD',
  pista: '#E2E5F0',
  fondo: '#F9F9F9',
} as const;

/** Historial: linear-gradient(140deg, #001A70, #4B1268 60%, #AF0F7D) — hero del calendario. */
export const gradientHistorial = {
  colors: [palette.marino, palette.ciruela, palette.morado] as const,
  locations: [0, 0.6, 1] as const,
} as const;

/** Aguamarina → morado: anillos de progreso (SVG) y badges de IA (✨). */
export const gradientIA = [palette.aguamarina, palette.morado] as const;

/** Principal: linear-gradient(135deg, #001A70, #AF0F7D) — racha, voz y CTA. */
export const gradientPrincipal = [palette.marino, palette.morado] as const;

/** Inmersivo: linear-gradient(165deg, #001A70, #4B1268 58%, #AF0F7D) — onboarding y hero. */
export const gradientInmersivo = {
  colors: [palette.marino, palette.ciruela, palette.morado] as const,
  locations: [0, 0.58, 1] as const,
} as const;

// #RRGGBBAA (soportado por RN y CSS) para no repetir rgba() con números sueltos fuera de la paleta.
export function withAlpha(hex: string, alpha: number): string {
  const alphaHex = Math.round(alpha * 255).toString(16).padStart(2, '0');
  return `${hex}${alphaHex}`;
}
