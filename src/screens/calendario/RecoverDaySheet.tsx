import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { useHabitStore } from '@/store/useHabitStore';
import { palette, withAlpha } from '@/theme/palette';
import { sheetShadow } from '@/theme/shadows';

interface RecoverDaySheetProps {
  date: Date;
  onClose: () => void;
}

/** Bottom sheet 3b: marcar lo que se hizo un día anterior para recuperarlo y recalcular la racha. */
export function RecoverDaySheet({ date, onClose }: RecoverDaySheetProps) {
  const habits = useHabitStore((s) => s.habits);
  const streakDays = useHabitStore((s) => s.streakDays);
  const [checkedIds, setCheckedIds] = useState<string[]>([]);

  const toggle = (id: string) =>
    setCheckedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const formatted = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long' })
    .format(date)
    .replace(',', '');
  const title = formatted.charAt(0).toUpperCase() + formatted.slice(1);

  return (
    <View className="absolute inset-0 z-10">
      <Pressable
        onPress={onClose}
        accessibilityLabel="Cerrar"
        className="absolute inset-0"
        style={{ backgroundColor: withAlpha(palette.tinta, 0.32) }}
      />
      <SlideUpSheet>
        <View className="mx-auto mb-3.5 h-[5px] w-10 rounded-[3px] bg-pista" />
        <Text className="text-[17px] font-bold text-tinta">{title}</Text>
        <Text className="mt-0.5 text-[13px] text-gris-500">
          ¿Hiciste algo ese día? Márcalo y tu racha se recalcula.
        </Text>
        {habits.map((habit, index) => (
          <Pressable
            key={habit.id}
            onPress={() => toggle(habit.id)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: checkedIds.includes(habit.id) }}
            className={`flex-row items-center gap-3 px-1 py-3 ${
              index === habits.length - 1 ? '' : 'border-b-[0.5px] border-marino/[0.07]'
            }`}
          >
            <Text className="text-xl">{habit.icon}</Text>
            <Text className="flex-1 text-[15.5px] font-semibold text-tinta">{habit.name}</Text>
            {checkedIds.includes(habit.id) ? (
              <View className="h-[30px] w-[30px] items-center justify-center rounded-full bg-aguamarina">
                <Svg width={12} height={10} viewBox="0 0 14 12">
                  <Path
                    d="M1 6.5L5 10.5L13 1.5"
                    stroke={palette.blanco}
                    strokeWidth={2.5}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
            ) : (
              <View className="h-[30px] w-[30px] rounded-full border-2 border-gris-200" />
            )}
          </Pressable>
        ))}
        {checkedIds.length > 0 ? (
          <Text className="mt-3.5 text-center text-[13px] font-bold text-teal-profundo">
            {/* TODO(persistencia): recálculo real de la racha; +3 replica el ejemplo del diseño (12 → 15). */}
            ✓ Día recuperado · tu racha ahora es de {streakDays + 3}
          </Text>
        ) : null}
      </SlideUpSheet>
    </View>
  );
}

function SlideUpSheet({ children }: { children: React.ReactNode }) {
  const translateY = useSharedValue(80);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withTiming(0, { duration: 320, easing: Easing.out(Easing.ease) });
    opacity.value = withTiming(1, { duration: 220 });
  }, [opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      className="absolute bottom-0 left-0 right-0 rounded-t-[28px] bg-white px-5 pb-[46px] pt-2.5"
      style={[sheetShadow, animatedStyle]}
    >
      {children}
    </Animated.View>
  );
}
