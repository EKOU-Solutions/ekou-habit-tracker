import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { gradientPrincipal, palette } from '@/theme/palette';
import { softBadgeShadow } from '@/theme/shadows';

// El scaleX anima un Animated.View contenedor: LinearGradient no reenvía la ref
// al nodo subyacente y las actualizaciones animadas directas se pierden.
function ProgressBar({ filled }: { filled: boolean }) {
  const progress = useSharedValue(filled ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(filled ? 1 : 0, {
      duration: 500,
      easing: Easing.ease,
    });
  }, [filled, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progress.value }],
  }));

  return (
    <View className="h-[5px] flex-1 overflow-hidden rounded-[3px] bg-pista">
      <Animated.View
        className="h-full overflow-hidden rounded-[3px]"
        style={[{ transformOrigin: 'left' }, animatedStyle]}
      >
        <LinearGradient
          colors={gradientPrincipal}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="h-full w-full"
        />
      </Animated.View>
    </View>
  );
}

/** Cabecera del stepper 2.1: volver + 3 barras de progreso + "N de 3". */
export function StepperHeader({ step, onBack }: { step: number; onBack: () => void }) {
  return (
    <View className="flex-row items-center gap-3.5 pt-1.5">
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Volver"
        hitSlop={8}
        className="h-9 w-9 items-center justify-center rounded-full bg-white"
        style={softBadgeShadow}
      >
        <Svg width={8} height={14} viewBox="0 0 8 14">
          <Path
            d="M7 1L1 7l6 6"
            stroke={palette.marino}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Pressable>
      <View className="flex-1 flex-row items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <ProgressBar key={i} filled={step >= i} />
        ))}
      </View>
      <Text className="text-xs text-gris-500">{step + 1} de 3</Text>
    </View>
  );
}
