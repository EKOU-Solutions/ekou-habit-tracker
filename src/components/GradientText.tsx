import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, type TextProps } from 'react-native';

import { gradientPrincipal, palette } from '@/theme/palette';

interface GradientTextProps extends TextProps {
  children: string;
}

// @react-native-masked-view's web target doesn't mask at all (confirmed in its own source: it
// just renders maskElement, ignoring children) — this color is only ever seen there or on any
// platform where masking fails; iOS/Android use the real gradient via native masking.
const MASK_FALLBACK_COLOR = palette.marino;

/** Texto relleno con el gradiente principal (linear-gradient(135deg,#001A70,#AF0F7D)). */
export function GradientText({ children, className, style, ...rest }: GradientTextProps) {
  const label = (
    <Text {...rest} className={className} style={[{ color: MASK_FALLBACK_COLOR }, style]}>
      {children}
    </Text>
  );
  return (
    <MaskedView maskElement={label}>
      <LinearGradient colors={gradientPrincipal} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Text {...rest} className={className} style={[style, { opacity: 0 }]}>
          {children}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
}
