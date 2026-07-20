import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { DAY_LETTERS, toDateKey } from '@/lib/dates';
import type { HabitHistory } from '@/lib/streak';
import { useHabitStore } from '@/store/useHabitStore';
import { gradientPrincipal, palette, withAlpha } from '@/theme/palette';
import { listShadow } from '@/theme/shadows';

type DayState = 'hecho' | 'hoy' | 'pendiente';

function currentWeek(history: HabitHistory): { letter: string; day: number; state: DayState }[] {
  const today = new Date();
  const mondayOffset = (today.getDay() + 6) % 7;
  return DAY_LETTERS.map((letter, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - mondayOffset + i);
    const hasDone = (history[toDateKey(date)]?.length ?? 0) > 0;
    const state: DayState = i === mondayOffset ? 'hoy' : hasDone ? 'hecho' : 'pendiente';
    return { letter, day: date.getDate(), state };
  });
}

/** Tira semanal L–D de la variante Agenda (1.2e). */
export function WeeklyStrip() {
  const history = useHabitStore((s) => s.history);
  return (
    <View className="mt-4 flex-row justify-between rounded-[20px] bg-white px-3.5 py-3" style={listShadow}>
      {currentWeek(history).map((d) => (
        <View key={d.letter} className="w-9 items-center gap-1.5">
          <Text
            className={`text-[10px] ${d.state === 'hoy' ? 'font-bold text-marino' : 'font-semibold text-gris-350'}`}
          >
            {d.letter}
          </Text>
          <DayBadge day={d.day} state={d.state} />
        </View>
      ))}
    </View>
  );
}

function DayBadge({ day, state }: { day: number; state: DayState }) {
  if (state === 'hecho') {
    return (
      <View
        className="h-[30px] w-[30px] items-center justify-center rounded-full"
        style={{ backgroundColor: withAlpha(palette.aguamarina, 0.18) }}
      >
        <Svg width={11} height={9} viewBox="0 0 14 12">
          <Path
            d="M1 6.5L5 10.5L13 1.5"
            stroke={palette.tealProfundo}
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
    );
  }
  if (state === 'hoy') {
    return (
      <LinearGradient
        colors={gradientPrincipal}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="h-[30px] w-[30px] items-center justify-center rounded-full"
      >
        <Text className="text-[13px] font-bold text-white">{day}</Text>
      </LinearGradient>
    );
  }
  return (
    <View className="h-[30px] w-[30px] items-center justify-center rounded-full bg-gris-100">
      <Text className="text-[13px] text-gris-300">{day}</Text>
    </View>
  );
}
