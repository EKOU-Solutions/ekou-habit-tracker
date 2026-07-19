import { useEffect, type ReactNode } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

/** popIn del diseño: scale .6 → 1.12 → 1 con fade-in. */
export function PopIn({ children, className }: { children: ReactNode; className?: string }) {
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.12, { duration: 280, easing: Easing.out(Easing.ease) }),
      withTiming(1, { duration: 140, easing: Easing.inOut(Easing.ease) }),
    );
    opacity.value = withTiming(1, { duration: 220 });
  }, [opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View className={className} style={animatedStyle}>
      {children}
    </Animated.View>
  );
}
