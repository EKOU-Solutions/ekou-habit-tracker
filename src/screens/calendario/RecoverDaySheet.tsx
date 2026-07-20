import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { BottomSheet } from '@/components/BottomSheet';
import { CheckIcon } from '@/components/icons';
import { capitalizeFirst, formatDayMonth } from '@/lib/dates';
import { useHabitStore } from '@/store/useHabitStore';
import { palette } from '@/theme/palette';

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

  return (
    <BottomSheet onClose={onClose} entrance="slide">
      <View className="px-5 pb-[46px] pt-2.5">
        <View className="mx-auto mb-3.5 h-[5px] w-10 rounded-[3px] bg-pista" />
        <Text className="text-[17px] font-bold text-tinta">{capitalizeFirst(formatDayMonth(date))}</Text>
        <Text className="mt-0.5 text-[13px] text-gris-500">
          ¿Hiciste algo ese día? Márcalo y tu racha se recalcula.
        </Text>
        {habits.map((habit, index) => (
          <Pressable
            key={habit.id}
            onPress={() => toggle(habit.id)}
            accessibilityRole="checkbox"
            accessibilityLabel={habit.name}
            accessibilityState={{ checked: checkedIds.includes(habit.id) }}
            className={`flex-row items-center gap-3 px-1 py-3 ${
              index === habits.length - 1 ? '' : 'border-b-[0.5px] border-marino/[0.07]'
            }`}
          >
            <Text className="text-xl">{habit.icon}</Text>
            <Text className="flex-1 text-[15.5px] font-semibold text-tinta">{habit.name}</Text>
            {checkedIds.includes(habit.id) ? (
              <View className="h-[30px] w-[30px] items-center justify-center rounded-full bg-aguamarina">
                <CheckIcon color={palette.blanco} />
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
      </View>
    </BottomSheet>
  );
}
