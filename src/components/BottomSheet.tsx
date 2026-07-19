import { useEffect, type ReactNode } from 'react';
import { BackHandler, Pressable, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { palette, withAlpha } from '@/theme/palette';
import { sheetShadow } from '@/theme/shadows';

interface BottomSheetProps {
  onClose: () => void;
  /** 'pop' reproduce el popIn del diseño (2.1e); 'slide' entra deslizando (3b). */
  entrance?: 'pop' | 'slide';
  children: ReactNode;
}

/**
 * Bottom sheet como overlay absoluto dentro del árbol de la pantalla (no Modal):
 * un Modal de RN renderiza en una jerarquía nativa separada donde NativeWind pierde
 * el contexto y los estilos className del contenido no se aplican. El botón atrás de
 * Android se intercepta con BackHandler para cerrar el sheet en vez de la pantalla.
 */
export function BottomSheet({ onClose, entrance = 'slide', children }: BottomSheetProps) {
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [onClose]);

  return (
    <View className="absolute inset-0 z-50 justify-end">
      <Pressable
        onPress={onClose}
        accessibilityLabel="Cerrar"
        className="absolute inset-0"
        style={{ backgroundColor: withAlpha(palette.tinta, 0.32) }}
      />
      <AnimatedPanel entrance={entrance}>{children}</AnimatedPanel>
    </View>
  );
}

function AnimatedPanel({ entrance, children }: { entrance: 'pop' | 'slide'; children: ReactNode }) {
  const scale = useSharedValue(entrance === 'pop' ? 0.6 : 1);
  const translateY = useSharedValue(entrance === 'pop' ? 40 : 80);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (entrance === 'pop') {
      scale.value = withSequence(
        withTiming(1.12, { duration: 280, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 140, easing: Easing.inOut(Easing.ease) }),
      );
    }
    translateY.value = withTiming(0, { duration: 320, easing: Easing.out(Easing.ease) });
    opacity.value = withTiming(1, { duration: 220 });
  }, [entrance, opacity, scale, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      className="rounded-t-[28px] bg-white"
      style={[sheetShadow, { transformOrigin: 'bottom' }, animatedStyle]}
    >
      {children}
    </Animated.View>
  );
}
