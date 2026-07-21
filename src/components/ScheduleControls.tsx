import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View } from 'react-native';

import { gradientPrincipal } from '@/theme/palette';
import { knobShadow, optionSelectedShadow, panelShadow } from '@/theme/shadows';

/** Círculo de día L–D; usado en Crear y Editar cuando la frecuencia es "días elegidos". */
export function DayCircle({
  letter,
  selected,
  onPress,
}: {
  letter: string;
  selected: boolean;
  onPress: () => void;
}) {
  if (selected) {
    return (
      <Pressable onPress={onPress} accessibilityRole="checkbox" accessibilityState={{ checked: selected }}>
        <LinearGradient
          colors={gradientPrincipal}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="h-[38px] w-[38px] items-center justify-center rounded-full"
        >
          <Text className="text-[13px] font-bold text-white">{letter}</Text>
        </LinearGradient>
      </Pressable>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      className="h-[38px] w-[38px] items-center justify-center rounded-full bg-gris-100"
    >
      <Text className="text-[13px] font-semibold text-gris-500">{letter}</Text>
    </Pressable>
  );
}

/** Tarjeta de momento del día (☀️/🌤️/🌙). */
export function MomentoCard({
  momento,
  selected,
  onPress,
}: {
  momento: { emoji: string; label: string };
  selected: boolean;
  onPress: () => void;
}) {
  if (selected) {
    return (
      <Pressable onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected }} className="flex-1">
        <LinearGradient
          colors={gradientPrincipal}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="items-center rounded-[20px] py-[18px]"
          style={optionSelectedShadow}
        >
          <Text className="text-[26px]">{momento.emoji}</Text>
          <Text className="mt-1.5 text-[13px] font-bold text-white">{momento.label}</Text>
        </LinearGradient>
      </Pressable>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      className="flex-1 items-center rounded-[20px] bg-white py-[18px]"
      style={panelShadow}
    >
      <Text className="text-[26px]">{momento.emoji}</Text>
      <Text className="mt-1.5 text-[13px] font-semibold text-gris-600">{momento.label}</Text>
    </Pressable>
  );
}

/** Switch del recordatorio. */
export function Toggle({ value, onToggle }: { value: boolean; onToggle: () => void }) {
  if (value) {
    return (
      <Pressable onPress={onToggle} accessibilityRole="switch" accessibilityState={{ checked: value }}>
        <LinearGradient
          colors={gradientPrincipal}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="h-7 w-[46px] justify-center rounded-full"
        >
          <View className="absolute right-[3px] h-[22px] w-[22px] rounded-full bg-white" style={knobShadow} />
        </LinearGradient>
      </Pressable>
    );
  }
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      className="h-7 w-[46px] justify-center rounded-full bg-gris-300"
    >
      <View className="absolute left-[3px] h-[22px] w-[22px] rounded-full bg-white" style={knobShadow} />
    </Pressable>
  );
}
