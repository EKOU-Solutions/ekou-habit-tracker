import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { CheckIcon } from '@/components/icons';
import type { Habit } from '@/store/useHabitStore';
import { gradientPrincipal, palette, withAlpha } from '@/theme/palette';
import { priorityCardShadow } from '@/theme/shadows';

/** Tarjeta del hábito del momento en "AHORA" (1.2b-d): degradado + wiggle de rescate si la racha está en riesgo. */
export function PriorityHabitCard({
  habit,
  isRiesgo,
  onPress,
}: {
  habit: Habit;
  isRiesgo: boolean;
  onPress: () => void;
}) {
  const nudge = useSharedValue(0);

  useEffect(() => {
    if (!isRiesgo) {
      nudge.value = 0;
      return;
    }
    nudge.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 4300 }),
        withTiming(-3, { duration: 100 }),
        withTiming(3, { duration: 130 }),
        withTiming(-2, { duration: 130 }),
        withTiming(2, { duration: 130 }),
        withTiming(0, { duration: 110 }),
      ),
      -1,
    );
  }, [isRiesgo, nudge]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: nudge.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      {isRiesgo ? <GlowNudge /> : null}
      <Pressable
        onPress={onPress}
        accessibilityRole="checkbox"
        accessibilityLabel={habit.name}
        accessibilityState={{ checked: habit.doneToday }}
      >
        <LinearGradient
          colors={gradientPrincipal}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="flex-row items-center gap-3.5 rounded-[24px] p-[18px]"
          style={priorityCardShadow}
        >
          <Text className="text-[32px]">{habit.icon}</Text>
          <View className="flex-1">
            <Text className="text-lg font-bold text-white">{habit.name}</Text>
            <Text className="mt-0.5 text-[13px] text-white/70">
              {isRiesgo ? 'tócalo y salva tu racha 🔥' : habit.scheduleLabel}
            </Text>
          </View>
          <PriorityCheck pulse={isRiesgo} />
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

/** glowNudge del diseño: la sombra no es animable en Android, así que pulsa un halo morado tras la tarjeta. */
function GlowNudge() {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 24,
          shadowColor: palette.morado,
          shadowOpacity: 0.5,
          shadowRadius: 32,
          shadowOffset: { width: 0, height: 10 },
          // Por debajo de la elevation de la tarjeta: en Android la elevation también ordena en z.
          elevation: 6,
          backgroundColor: palette.morado,
        },
        animatedStyle,
      ]}
    />
  );
}

function PriorityCheck({ pulse }: { pulse: boolean }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!pulse) {
      scale.value = 1;
      return;
    }
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
  }, [pulse, scale]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View
      style={[
        {
          height: 46,
          width: 46,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 23,
          borderWidth: 2,
          borderColor: withAlpha(palette.blanco, 0.65),
        },
        animatedStyle,
      ]}
    >
      <CheckIcon color={withAlpha(palette.blanco, 0.65)} width={16} height={13} />
    </Animated.View>
  );
}

/** Fila de hábito en "Hoy" (1.2b-d): check aguamarina si está hecho, chip de temporizador si aplica. */
export function HabitRow({
  habit,
  onPress,
  isLast,
}: {
  habit: Habit;
  onPress: () => void;
  isLast: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityLabel={habit.name}
      accessibilityState={{ checked: habit.doneToday }}
      className={`flex-row items-center gap-3 px-4 py-[13px] ${isLast ? '' : 'border-b-[0.5px] border-marino/[0.07]'}`}
    >
      <View className="h-[42px] w-[42px] items-center justify-center rounded-[13px] bg-gris-100">
        <Text className="text-[21px]">{habit.icon}</Text>
      </View>
      <View className="flex-1">
        <Text
          className={`text-base font-semibold ${habit.doneToday ? 'text-gris-350' : 'text-tinta'}`}
        >
          {habit.name}
        </Text>
        <Text
          className={`mt-px text-[12.5px] ${habit.doneToday ? 'text-gris-300' : 'text-gris-500'}`}
        >
          {habit.scheduleLabel}
        </Text>
      </View>
      {habit.timerLabel ? (
        <View className="flex-row items-center gap-[5px] rounded-full bg-aguamarina/[0.16] px-[11px] py-1.5">
          <Text className="text-[9px] text-teal-profundo">▶</Text>
          <Text className="text-[12.5px] font-bold text-teal-profundo">{habit.timerLabel}</Text>
        </View>
      ) : null}
      {habit.doneToday ? (
        <View className="h-[30px] w-[30px] items-center justify-center rounded-full bg-aguamarina">
          <CheckIcon color={palette.blanco} />
        </View>
      ) : (
        <View className="h-[30px] w-[30px] rounded-full border-2 border-gris-200" />
      )}
    </Pressable>
  );
}
