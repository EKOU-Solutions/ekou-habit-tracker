import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Path, Stop } from 'react-native-svg';

import { capitalizeFirst, DAY_LETTERS, toDateKey } from '@/lib/dates';
import { firstActivityKey, type HabitHistory } from '@/lib/streak';
import { DayRing, type DayKind } from '@/screens/calendario/DayRing';
import { RecoverDaySheet } from '@/screens/calendario/RecoverDaySheet';
import { useBestStreak, useHabitStore, useStreak } from '@/store/useHabitStore';
import { gradientHistorial, gradientIA, gradientPrincipal, palette, withAlpha } from '@/theme/palette';
import { cardShadow, heroHistorialShadow, softBadgeShadow } from '@/theme/shadows';

function monthGrid(
  year: number,
  month: number,
  today: Date,
  history: HabitHistory,
  totalHabits: number,
): DayKind[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const mondayOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const firstActivity = firstActivityKey(history);

  const cells: DayKind[] = Array.from({ length: mondayOffset }, () => ({ type: 'blank' }));
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const key = toDateKey(date);
    const doneCount = history[key]?.length ?? 0;
    if (date.getTime() === todayStart.getTime()) cells.push({ type: 'today', day });
    else if (date > todayStart) cells.push({ type: 'future', day });
    // Los días anteriores al primer registro no cuentan como fallo: el app aún no se usaba.
    else if (firstActivity === null || key < firstActivity) cells.push({ type: 'off', day });
    else if (doneCount === 0) cells.push({ type: 'fail', day });
    else {
      const pct = Math.min(100, Math.round((doneCount / Math.max(totalHabits, 1)) * 100));
      cells.push({ type: 'pct', day, pct });
    }
  }
  return cells;
}

/** Calendario / historial (3a-b): mes con anillos de cumplimiento y recuperación de días. */
export function CalendarioScreen() {
  const insets = useSafeAreaInsets();
  const habits = useHabitStore((s) => s.habits);
  const history = useHabitStore((s) => s.history);
  const streakDays = useStreak();
  const bestStreakDays = useBestStreak();
  const today = new Date();
  const [monthDate, setMonthDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [recoverDay, setRecoverDay] = useState<number | null>(null);

  const cells = monthGrid(monthDate.getFullYear(), monthDate.getMonth(), today, history, habits.length);
  const pastPcts = cells.filter((c): c is Extract<DayKind, { type: 'pct' }> => c.type === 'pct');
  const failCount = cells.filter((c) => c.type === 'fail').length;
  const compliance =
    pastPcts.length > 0
      ? Math.round(pastPcts.reduce((sum, c) => sum + c.pct, 0) / (pastPcts.length + failCount))
      : null;

  const monthName = new Intl.DateTimeFormat('es', { month: 'long' }).format(monthDate);
  const monthTitle = `${capitalizeFirst(monthName)} ${monthDate.getFullYear()}`;

  const shiftMonth = (delta: number) => {
    setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() + delta, 1));
  };

  const handleDayPress = (kind: DayKind) => {
    if (kind.type === 'fail' || kind.type === 'pct') setRecoverDay(kind.day);
  };

  return (
    <View className="flex-1 bg-fondo">
      <ScrollView
        contentContainerStyle={{
          paddingTop: Math.max(82, insets.top + 23),
          paddingHorizontal: 20,
          paddingBottom: 40,
        }}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-extrabold tracking-[-0.4px] text-marino">Historial</Text>
          <View className="flex-row gap-2">
            <NavButton direction="back" label="Mes anterior" onPress={() => shiftMonth(-1)} />
            <NavButton direction="forward" label="Mes siguiente" onPress={() => shiftMonth(1)} />
          </View>
        </View>

        <LinearGradient
          colors={gradientHistorial.colors}
          locations={gradientHistorial.locations}
          start={{ x: 0.12, y: 0 }}
          end={{ x: 0.88, y: 1 }}
          className="mt-3.5 overflow-hidden rounded-[26px] p-5"
          style={heroHistorialShadow}
        >
          <View
            className="absolute -right-6 -top-6 h-[150px] w-[150px] rounded-full border-[1.5px]"
            style={{ borderColor: withAlpha(palette.blanco, 0.14) }}
          />
          <View
            className="absolute right-1.5 top-3.5 h-24 w-24 rounded-full border-[1.5px]"
            style={{ borderColor: withAlpha(palette.aguamarina, 0.35) }}
          />
          <View className="flex-row items-center gap-[18px]">
            <Text className="text-[64px] leading-[68px]">🔥</Text>
            <View>
              <View className="flex-row items-baseline gap-1.5">
                <Text className="text-[52px] font-extrabold leading-[54px] tracking-[-2px] text-white">
                  {streakDays}
                </Text>
                <Text className="text-base font-semibold text-white/75">días</Text>
              </View>
              <Text className="mt-1 text-[13.5px] text-white/[0.72]">
                Tu racha viva · mejor: {bestStreakDays} días
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View className="mb-2 mt-[18px] flex-row items-center px-0.5">
          <Text className="text-base font-extrabold text-marino">{monthTitle}</Text>
          <View className="flex-1" />
          {compliance !== null ? (
            <View className="rounded-[14px] bg-aguamarina/[0.16] px-[11px] py-[5px]">
              <Text className="text-[12.5px] font-bold text-teal-profundo">{compliance}% cumplido</Text>
            </View>
          ) : null}
        </View>

        <View className="rounded-[24px] bg-white px-2.5 pb-2.5 pt-3.5" style={cardShadow}>
          <View className="mb-1.5 flex-row">
            {DAY_LETTERS.map((letter) => (
              <Text key={letter} className="flex-1 text-center text-[11px] font-bold text-gris-350">
                {letter}
              </Text>
            ))}
          </View>
          <View className="flex-row flex-wrap">
            {cells.map((kind, i) => {
              const recoverable = kind.type === 'fail' || kind.type === 'pct';
              return (
                <Pressable
                  key={i}
                  onPress={() => handleDayPress(kind)}
                  disabled={!recoverable}
                  accessibilityRole={recoverable ? 'button' : 'none'}
                  accessibilityLabel={recoverable ? `Recuperar día ${kind.day}` : undefined}
                  hitSlop={4}
                  className="mb-1.5 items-center py-0.5"
                  style={{ width: '14.285%' }}
                >
                  <DayRing kind={kind} />
                </Pressable>
              );
            })}
          </View>
          <View className="mt-2 flex-row justify-center gap-4 border-t-[0.5px] border-marino/[0.06] pb-1 pt-3">
            <LegendItem label="completo">
              <LinearGradient
                colors={gradientIA}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="h-3 w-3 rounded-full"
              />
            </LegendItem>
            <LegendItem label="parcial">
              <PartialDot />
            </LegendItem>
            <LegendItem label="hoy">
              <LinearGradient
                colors={gradientPrincipal}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="h-3 w-3 rounded-full"
              />
            </LegendItem>
          </View>
        </View>
      </ScrollView>

      {recoverDay !== null ? (
        <RecoverDaySheet
          date={new Date(monthDate.getFullYear(), monthDate.getMonth(), recoverDay)}
          onClose={() => setRecoverDay(null)}
        />
      ) : null}
    </View>
  );
}

function NavButton({
  direction,
  label,
  onPress,
}: {
  direction: 'back' | 'forward';
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      className="h-9 w-9 items-center justify-center rounded-full bg-white"
      style={softBadgeShadow}
    >
      <Svg width={8} height={14} viewBox="0 0 8 14">
        <Path
          d={direction === 'back' ? 'M7 1L1 7l6 6' : 'M1 1l6 6-6 6'}
          stroke={palette.marino}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </Pressable>
  );
}

function LegendItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="flex-row items-center gap-[5px]">
      {children}
      <Text className="text-[11px] font-semibold text-gris-500">{label}</Text>
    </View>
  );
}

// Disco relleno con cuña de gradiente al 60% (leyenda 'parcial' del diseño: conic 60% + track).
function PartialDot() {
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12">
      <Defs>
        <SvgLinearGradient id="legend-partial" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={palette.aguamarina} />
          <Stop offset="1" stopColor={palette.morado} />
        </SvgLinearGradient>
      </Defs>
      <Circle cx={6} cy={6} r={6} fill={palette.anilloTrack} />
      <Path d="M6 6 L6 0 A6 6 0 1 1 2.47 10.85 Z" fill="url(#legend-partial)" />
    </Svg>
  );
}
