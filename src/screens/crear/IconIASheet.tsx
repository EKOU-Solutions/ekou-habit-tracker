import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { BottomSheet } from '@/components/BottomSheet';
import { gradientPrincipal, palette, withAlpha } from '@/theme/palette';
import { primaryCtaShadow } from '@/theme/shadows';

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
    <BottomSheet onClose={onClose} entrance="pop">
      <View className="px-[22px] pb-[46px] pt-2.5">
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
      </View>
    </BottomSheet>
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
  const cell = (
    <>
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
    </>
  );

  if (selected) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="radio"
        accessibilityState={{ selected }}
        className="aspect-square w-[48%]"
      >
        <LinearGradient
          colors={[withAlpha(palette.aguamarina, 0.14), withAlpha(palette.morado, 0.1)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="h-full w-full items-center justify-center rounded-[22px]"
          style={{ borderWidth: 2.5, borderColor: palette.morado }}
        >
          {cell}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      className="aspect-square w-[48%] items-center justify-center rounded-[22px]"
      style={{ backgroundColor: palette.gris50 }}
    >
      {cell}
    </Pressable>
  );
}

function GeneratingCell() {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.linear }), -1);
  }, [shimmer]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shimmer.value, [0, 1], [-160, 160]) }],
  }));

  return (
    <View className="aspect-square w-[48%] items-center justify-center gap-2 overflow-hidden rounded-[22px] bg-gris-150">
      <Animated.View className="absolute inset-0" style={animatedStyle}>
        <LinearGradient
          colors={[withAlpha(palette.blanco, 0), withAlpha(palette.blanco, 0.55), withAlpha(palette.blanco, 0)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="h-full w-full"
        />
      </Animated.View>
      <Text className="text-[22px] opacity-55">✨</Text>
      <Text className="text-[11.5px] font-bold tracking-[0.06em] text-gris-500">GENERANDO…</Text>
    </View>
  );
}
