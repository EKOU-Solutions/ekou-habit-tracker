import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { palette, withAlpha } from '@/theme/palette';

const RIPPLE_DURATION_MS = 3600;

/** Ondas del diseño: scale .55 → 1.55 y opacity .85 → 0, en bucle. */
function Ripple({ delayMs, borderColor }: { delayMs: number; borderColor: string }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delayMs,
      withRepeat(
        withTiming(1, { duration: RIPPLE_DURATION_MS, easing: Easing.out(Easing.ease) }),
        -1,
        false,
      ),
    );
  }, [delayMs, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.55 + progress.value }],
    opacity: 0.85 * (1 - progress.value),
  }));

  return <Animated.View style={[styles.ripple, { borderColor }, animatedStyle]} />;
}

// Orbe de EKOU (diseño 1.1): núcleo estático + tres ondas de eco escalonadas.
export function EchoOrb() {
  return (
    <View className="h-[170px] items-center justify-center">
      <Ripple delayMs={0} borderColor={withAlpha(palette.blanco, 0.35)} />
      <Ripple delayMs={1200} borderColor={withAlpha(palette.aguamarina, 0.5)} />
      <Ripple delayMs={2400} borderColor={withAlpha(palette.blanco, 0.2)} />
      <View className="h-16 w-16 items-center justify-center rounded-full border-[1.5px] border-white/40 bg-white/[0.14]">
        <View className="h-[34px] w-[34px] items-center justify-center rounded-full border-[1.5px] border-white/60">
          <View
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: palette.aguamarina }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ripple: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1.5,
  },
});
