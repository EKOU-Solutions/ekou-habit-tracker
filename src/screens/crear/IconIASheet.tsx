import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { gradientPrincipal, palette, withAlpha } from '@/theme/palette';
import { primaryCtaShadow, sheetShadow } from '@/theme/shadows';

// TODO(IA): propuestas reales generadas a partir del nombre; por ahora las del diseño.
const PROPOSED_ICONS = ['🧘', '🕯️', '☮️'];

interface IconIASheetProps {
  habitName: string;
  onPick: (icon: string) => void;
  onClose: () => void;
}

/** Sheet 2.1e — Ícono con IA: propuestas, celda "generando…", descripción propia y CTA de uso. */
export function IconIASheet({ habitName, onPick, onClose }: IconIASheetProps) {
  const [selected, setSelected] = useState(PROPOSED_ICONS[0]);

  return (
    <View className="absolute inset-0 z-10">
      <Pressable
        onPress={onClose}
        accessibilityLabel="Cerrar"
        className="absolute inset-0"
        style={{ backgroundColor: withAlpha(palette.tinta, 0.32) }}
      />
      <PopInSheet>
        <View className="mx-auto mb-4 h-[5px] w-[38px] rounded-[3px] bg-pista" />
        <View className="flex-row items-center gap-2">
          <Text className="text-[19px]">✨</Text>
          <Text className="text-[21px] font-extrabold tracking-[-0.3px] text-tinta">Ícono con IA</Text>
        </View>
        <Text className="mt-[5px] text-[13.5px] text-gris-500">
          Propuestas para <Text className="font-bold text-tinta">«{habitName}»</Text>
        </Text>

        <View className="mt-[18px] flex-row flex-wrap justify-between gap-y-3">
          {PROPOSED_ICONS.map((icon) => (
            <IconCell
              key={icon}
              icon={icon}
              selected={icon === selected}
              onPress={() => setSelected(icon)}
            />
          ))}
          <GeneratingCell />
        </View>

        <View className="mt-4 flex-row items-center gap-2.5 rounded-[22px] bg-gris-100 px-4 py-3">
          <Text className="flex-1 text-sm text-gris-500">Descríbelo tú · «flor de loto»…</Text>
          <Text className="text-[15px]">✨</Text>
        </View>

        <Pressable onPress={() => onPick(selected)} accessibilityRole="button">
          <LinearGradient
            colors={gradientPrincipal}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="mt-4 h-[54px] items-center justify-center rounded-full"
            style={primaryCtaShadow}
          >
            <Text className="text-[16.5px] font-bold text-white">Usar este ícono</Text>
          </LinearGradient>
        </Pressable>
        <Text className="mt-3.5 text-center text-[13px] font-bold text-morado">Generar 4 más</Text>
      </PopInSheet>
    </View>
  );
}

function IconCell({
  icon,
  selected,
  onPress,
}: {
  icon: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      className="aspect-square w-[48%] items-center justify-center rounded-[22px]"
      style={
        selected
          ? { backgroundColor: withAlpha(palette.aguamarina, 0.14), borderWidth: 2.5, borderColor: palette.morado }
          : { backgroundColor: palette.gris50 }
      }
    >
      <Text className="text-[56px]">{icon}</Text>
      {selected ? (
        <LinearGradient
          colors={gradientPrincipal}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="absolute right-2.5 top-2.5 h-[26px] w-[26px] items-center justify-center rounded-full"
        >
          <Svg width={12} height={10} viewBox="0 0 12 10">
            <Path
              d="M1 5l3.5 3.5L11 1"
              stroke={palette.blanco}
              strokeWidth={2.2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </LinearGradient>
      ) : null}
    </Pressable>
  );
}

function GeneratingCell() {
  const opacity = useSharedValue(0.55);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.55, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      className="aspect-square w-[48%] items-center justify-center gap-2 rounded-[22px] bg-gris-150"
      style={animatedStyle}
    >
      <Text className="text-[22px] opacity-55">✨</Text>
      <Text className="text-[11.5px] font-bold tracking-[0.06em] text-gris-500">GENERANDO…</Text>
    </Animated.View>
  );
}

function PopInSheet({ children }: { children: React.ReactNode }) {
  const scale = useSharedValue(0.94);
  const translateY = useSharedValue(40);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.back(1.4)) });
    translateY.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.ease) });
    opacity.value = withTiming(1, { duration: 250 });
  }, [opacity, scale, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      className="absolute bottom-0 left-0 right-0 rounded-t-[28px] bg-white px-[22px] pb-[46px] pt-2.5"
      style={[sheetShadow, animatedStyle]}
    >
      {children}
    </Animated.View>
  );
}
