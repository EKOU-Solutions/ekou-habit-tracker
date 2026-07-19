/**
 * Paleta y gradientes de EKOU (doc/ux-ui-guidelines.md §2).
 * Los colores también están registrados en tailwind.config.js; este módulo
 * existe para los componentes que necesitan los valores crudos (gradientes,
 * caret del input, sombras…), donde no aplican clases de Tailwind.
 */
export const palette = {
  marino: '#001A70',
  aguamarina: '#2DCCD3',
  tealProfundo: '#0E7C81',
  morado: '#AF0F7D',
  ciruela: '#4B1268',
} as const;

/** Principal: linear-gradient(135deg, #001A70, #AF0F7D) — racha, voz y CTA. */
export const gradientPrincipal = [palette.marino, palette.morado] as const;

/** Inmersivo: linear-gradient(165deg, #001A70, #4B1268 58%, #AF0F7D) — onboarding y hero. */
export const gradientInmersivo = {
  colors: [palette.marino, palette.ciruela, palette.morado] as const,
  locations: [0, 0.58, 1] as const,
} as const;
