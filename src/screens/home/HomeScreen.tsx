import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, type ReactNode } from 'react';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path, Rect } from 'react-native-svg';

import { AvatarBadge } from '@/components/AvatarBadge';
import { MicIcon } from '@/components/icons';
import { formatDayMonth } from '@/lib/dates';
import { DiaCeroKit } from '@/screens/home/DiaCeroKit';
import { HabitRow, PriorityHabitCard } from '@/screens/home/HabitCard';
import { RachaRing } from '@/screens/home/RachaRing';
import { WeeklyStrip } from '@/screens/home/WeeklyStrip';
import { useHabitStore, type Habit } from '@/store/useHabitStore';
import { useUserStore } from '@/store/useUserStore';
import { gradientPrincipal, palette } from '@/theme/palette';
import {
  floatingButtonShadow,
  listShadow,
  streakChipShadow,
  voiceButtonShadow,
} from '@/theme/shadows';

// TODO(Ajustes): preferencia editable cuando exista la pantalla de Ajustes; 'agenda' (1.2e)
// muestra el chip de racha y la tira semanal.
const HOME_LAYOUT: 'anillo' | 'agenda' = 'agenda';

// "Lo prioritario, siempre arriba": el hábito del momento es el prioritario pendiente,
// si no cualquier pendiente, y con el día completo se mantiene el primero (layout 1.2d).
function habitOfTheMoment(habits: Habit[]): Habit | undefined {
  return (
    habits.find((h) => h.isPriority && !h.doneToday) ??
    habits.find((h) => !h.doneToday) ??
    habits.find((h) => h.isPriority) ??
    habits[0]
  );
}

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const nickname = useUserStore((s) => s.nickname);
  const habits = useHabitStore((s) => s.habits);
  const streakDays = useHabitStore((s) => s.streakDays);
  const toggleHabit = useHabitStore((s) => s.toggleHabit);

  if (habits.length === 0) return <DiaCeroKit />;

  const priorityHabit = habitOfTheMoment(habits);
  const restHabits = habits.filter((h) => h.id !== priorityHabit?.id);
  const checkedCount = habits.filter((h) => h.doneToday).length;
  const isRiesgo = checkedCount === 0;
  const isAgenda = HOME_LAYOUT === 'agenda';

  const handleToggle = (habit: Habit) => {
    toggleHabit(habit.id);
    if (Platform.OS === 'web') return;
    const completesDay =
      !habit.doneToday && habits.filter((h) => h.doneToday || h.id === habit.id).length === habits.length;
    if (completesDay) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <View className="flex-1 bg-fondo">
      <ScrollView
        contentContainerStyle={{
          paddingTop: Math.max(82, insets.top + 23),
          paddingHorizontal: 20,
          paddingBottom: 130,
        }}
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-[22px] font-bold tracking-[-0.3px] text-marino">
              Hola, {nickname || 'ahí'}
            </Text>
            <Text className="mt-0.5 text-[13px] text-gris-500">{formatDayMonth(new Date())}</Text>
          </View>
          {isAgenda ? <StreakChip streakDays={streakDays} /> : <AvatarBadge nickname={nickname} />}
        </View>

        {isAgenda ? <WeeklyStrip /> : null}

        <View className="mt-3.5 items-center">
          <RachaRing streakDays={streakDays} checkedCount={checkedCount} totalCount={habits.length} />
        </View>

        {priorityHabit ? (
          <>
            <SectionLabel topMargin="mt-3.5">AHORA · ESTA MAÑANA</SectionLabel>
            <PriorityHabitCard
              habit={priorityHabit}
              isRiesgo={isRiesgo}
              onPress={() => handleToggle(priorityHabit)}
            />
          </>
        ) : null}

        {restHabits.length > 0 ? (
          <>
            <SectionLabel topMargin="mt-4">HOY</SectionLabel>
            <View className="rounded-[24px] bg-white" style={listShadow}>
              {restHabits.map((habit, index) => (
                <HabitRow
                  key={habit.id}
                  habit={habit}
                  isLast={index === restHabits.length - 1}
                  onPress={() => handleToggle(habit)}
                />
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>

      <BottomActions bottomInset={insets.bottom} />
    </View>
  );
}

function SectionLabel({ children, topMargin }: { children: string; topMargin: string }) {
  return (
    <Text className={`mb-2 ml-1 ${topMargin} text-[11px] font-bold tracking-[0.09em] text-gris-500`}>
      {children}
    </Text>
  );
}

function StreakChip({ streakDays }: { streakDays: number }) {
  return (
    <LinearGradient
      colors={gradientPrincipal}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-row items-center gap-[7px] rounded-[22px] px-[15px] py-[9px]"
      style={streakChipShadow}
    >
      <View className="h-2 w-2 rounded-full bg-aguamarina" />
      <Text className="text-[15px] font-extrabold text-white">{streakDays}</Text>
      <Text className="text-xs font-semibold text-white/75">días</Text>
    </LinearGradient>
  );
}

function BottomActions({ bottomInset }: { bottomInset: number }) {
  const router = useRouter();
  return (
    <View
      className="absolute left-0 right-0 flex-row items-center justify-center gap-5"
      style={{ bottom: Math.max(30, bottomInset + 8) }}
    >
      <RoundButton label="Crear hábito" onPress={() => router.push('/crear/texto')}>
        <Svg width={20} height={20} viewBox="0 0 20 20">
          <Path d="M10 3v14M3 10h14" stroke={palette.marino} strokeWidth={2.2} strokeLinecap="round" />
        </Svg>
      </RoundButton>
      <VoiceButton onPress={() => router.push('/crear/voz')} />
      <RoundButton label="Calendario" onPress={() => router.push('/calendario')}>
        <Svg width={20} height={20} viewBox="0 0 20 20">
          <Rect x={2} y={3} width={16} height={15} rx={4} fill="none" stroke={palette.marino} strokeWidth={1.8} />
          <Path d="M2 8h16" stroke={palette.marino} strokeWidth={1.8} />
          <Path d="M6.5 1.5v3M13.5 1.5v3" stroke={palette.marino} strokeWidth={1.8} strokeLinecap="round" />
        </Svg>
      </RoundButton>
    </View>
  );
}

function RoundButton({
  children,
  label,
  onPress,
}: {
  children: ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="h-[52px] w-[52px] items-center justify-center rounded-full bg-white/[0.92]"
      style={floatingButtonShadow}
    >
      {children}
    </Pressable>
  );
}

function VoiceButton({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1300, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Dictar hábito a EKOU">
      <Animated.View style={animatedStyle}>
        <LinearGradient
          colors={gradientPrincipal}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="h-[68px] w-[68px] items-center justify-center rounded-full"
          style={voiceButtonShadow}
        >
          <MicIcon color={palette.blanco} size={26} />
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}
