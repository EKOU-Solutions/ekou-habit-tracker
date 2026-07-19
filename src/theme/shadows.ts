import type { ViewStyle } from 'react-native';

import { palette } from '@/theme/palette';

// Sombras del diseño como objetos de estilo explícitos: las utilidades shadow-{color}/{opacity}
// de NativeWind no traducen de forma confiable a shadowColor/shadowOpacity/elevation en RN.
export const cardShadow: ViewStyle = {
  shadowColor: palette.marino,
  shadowOpacity: 0.06,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};

export const listShadow: ViewStyle = {
  shadowColor: palette.marino,
  shadowOpacity: 0.05,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
};

export const panelShadow: ViewStyle = {
  shadowColor: palette.marino,
  shadowOpacity: 0.06,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
};

export const resultCardShadow: ViewStyle = {
  shadowColor: palette.marino,
  shadowOpacity: 0.1,
  shadowRadius: 30,
  shadowOffset: { width: 0, height: 10 },
  elevation: 8,
};

export const knobShadow: ViewStyle = {
  shadowColor: '#000',
  shadowOpacity: 0.2,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 1 },
  elevation: 2,
};

export const todayGlowShadow: ViewStyle = {
  shadowColor: palette.morado,
  shadowOpacity: 0.4,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 6,
};

export const crearCtaShadow: ViewStyle = {
  shadowColor: palette.morado,
  shadowOpacity: 0.35,
  shadowRadius: 26,
  shadowOffset: { width: 0, height: 10 },
  elevation: 10,
};

export const softBadgeShadow: ViewStyle = {
  shadowColor: palette.marino,
  shadowOpacity: 0.08,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
};

export const floatingButtonShadow: ViewStyle = {
  shadowColor: palette.marino,
  shadowOpacity: 0.12,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 2 },
  elevation: 4,
};

export const priorityCardShadow: ViewStyle = {
  shadowColor: palette.marino,
  shadowOpacity: 0.22,
  shadowRadius: 26,
  shadowOffset: { width: 0, height: 10 },
  elevation: 8,
};

export const voiceButtonShadow: ViewStyle = {
  shadowColor: palette.morado,
  shadowOpacity: 0.4,
  shadowRadius: 28,
  shadowOffset: { width: 0, height: 10 },
  elevation: 10,
};

export const streakChipShadow: ViewStyle = {
  shadowColor: palette.morado,
  shadowOpacity: 0.28,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 6,
};

export const primaryCtaShadow: ViewStyle = {
  shadowColor: palette.morado,
  shadowOpacity: 0.32,
  shadowRadius: 26,
  shadowOffset: { width: 0, height: 10 },
  elevation: 10,
};

export const optionSelectedShadow: ViewStyle = {
  shadowColor: palette.morado,
  shadowOpacity: 0.28,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 8 },
  elevation: 6,
};

export const iconTileShadow: ViewStyle = {
  shadowColor: palette.marino,
  shadowOpacity: 0.12,
  shadowRadius: 30,
  shadowOffset: { width: 0, height: 10 },
  elevation: 6,
};

export const sheetShadow: ViewStyle = {
  shadowColor: palette.marino,
  shadowOpacity: 0.18,
  shadowRadius: 40,
  shadowOffset: { width: 0, height: -12 },
  elevation: 20,
};

export const heroHistorialShadow: ViewStyle = {
  shadowColor: palette.marino,
  shadowOpacity: 0.28,
  shadowRadius: 34,
  shadowOffset: { width: 0, height: 14 },
  elevation: 12,
};
