import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Path, Stop } from 'react-native-svg';

import { DayRing, type DayKind } from '@/screens/calendario/DayRing';
import { RecoverDaySheet } from '@/screens/calendario/RecoverDaySheet';
import { useHabitStore } from '@/store/useHabitStore';
import { gradientHistorial, gradientPrincipal, palette, withAlpha } from '@/theme/palette';
import { cardShadow, heroHistorialShadow, softBadgeShadow } from '@/theme/shadows';

const DAY_LETTERS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

// TODO(persistencia): historial real por día; patrón de ejemplo del diseño hasta que llegue MMKV.
const DEMO_PCTS: Record<number, number> = {
  4: 100, 5: 100, 6: 80, 7: 100, 8: 100, 9: 100, 10: 60,
  11: 100, 12: 100, 13: 100, 14: 100, 15: 100, 16: 60, 17: 100, 18: 100,
};
const DEMO_FAIL_DAY = 3;
const DEMO_BEST_STREAK = 21;

function monthGrid(year: number, month: number, today: Date): DayKind[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const mondayOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const isPastMonth = new Date(year, month + 1, 0) < today;

  const cells: DayKind[] = Array.from({ length: mondayOffset }, () => ({ type: 'blank' }));
  for (let day = 1; day <= daysInMonth; day++) {
    if (isCurrentMonth && day === today.getDate()) cells.push({ type: 'today', day });
    else if (isCurrentMonth && day > today.getDate()) cells.push({ type: 'future', day });
    else if (!isCurrentMonth && !isPastMonth) cells.push({ type: 'future', day });
    else if (!isCurrentMonth) cells.push({ type: 'off', day });
    else if (day === DEMO_FAIL_DAY) cells.push({ type: 'fail', day });
    else if (DEMO_PCTS[day] !== undefined) cells.push({ type: 'pct', day, pct: DEMO_PCTS[day] });
    else cells.push({ type: 'off', day });
  }
  return cells;
}

/** Calendario / historial (3a-b): mes con anillos de cumplimiento y recuperación de días. */
export function CalendarioScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const streakDays = useHabitStore((s) => s.streakDays);
  const today = new Date();
  const [monthDate, setMonthDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [recoverDay, setRecoverDay] = useState<number | null>(null);

  const cells = monthGrid(monthDate.getFullYear(), monthDate.getMonth(), today);
  const pastPcts = cells.filter((c): c is Extract<DayKind, { type: 'pct' }> => c.type === 'pct');
  const failCount = cells.filter((c) => c.type === 'fail').length;
  const compliance =
    pastPcts.length > 0
      ? Math.round(pastPcts.reduce((sum, c) => sum + c.pct, 0) / (pastPcts.length + failCount))
      : null;

  const monthName = new Intl.DateTimeFormat('es', { month: 'long' }).format(monthDate);
  const monthTitle = `${monthName.charAt(0).toUpperCase()}${monthName.slice(1)} ${monthDate.getFullYear()}`;

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
            <NavButton direction="back" label="Volver" onPress={() => router.back()} />
            <NavButton direction="forward" label="Mes siguiente" onPress={() => shiftMonth(1)} />
          </View>
        </View>

        <LinearGradient
          colors={gradientHistorial.colors}
          locations={gradientHistorial.locations}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0.9 }}
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
                Tu racha viva · mejor: {DEMO_BEST_STREAK} días
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
            {cells.map((kind, i) => (
              <Pressable
                key={i}
                onPress={() => handleDayPress(kind)}
                accessibilityRole={kind.type === 'blank' ? 'none' : 'button'}
                className="mb-1.5 items-center"
                style={{ width: '14.285%' }}
              >
                <DayRing kind={kind} />
              </Pressable>
            ))}
          </View>
          <View className="mt-2 flex-row justify-center gap-4 border-t-[0.5px] border-marino/[0.06] pb-1 pt-3">
            <LegendItem label="completo">
              <LinearGradient
                colors={[palette.aguamarina, palette.morado]}
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

function PartialDot() {
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12" style={{ transform: [{ rotate: '-90deg' }] }}>
      <Defs>
        <SvgLinearGradient id="legend-partial" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={palette.aguamarina} />
          <Stop offset="1" stopColor={palette.morado} />
        </SvgLinearGradient>
      </Defs>
      <Circle cx={6} cy={6} r={4.5} fill="none" stroke={palette.anilloTrack} strokeWidth={3} />
      <Circle
        cx={6}
        cy={6}
        r={4.5}
        fill="none"
        stroke="url(#legend-partial)"
        strokeWidth={3}
        strokeDasharray={2 * Math.PI * 4.5}
        strokeDashoffset={2 * Math.PI * 4.5 * 0.4}
      />
    </Svg>
  );
}
