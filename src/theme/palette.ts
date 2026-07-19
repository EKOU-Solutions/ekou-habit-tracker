// Paleta EKOU (doc/ux-ui-guidelines.md §2); valores crudos para donde no aplican clases de Tailwind.
export const palette = {
  marino: '#001A70',
  aguamarina: '#2DCCD3',
  tealProfundo: '#0E7C81',
  morado: '#AF0F7D',
  ciruela: '#4B1268',
  blanco: '#FFFFFF',
} as const;

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
