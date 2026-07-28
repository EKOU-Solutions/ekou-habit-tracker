import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

import { todayKey } from '@/lib/dates';
import { formatCountdown, parseTimerSeconds } from '@/lib/timer';
import { useDoneIds, useHabitStore } from '@/store/useHabitStore';
import { gradientInmersivo, palette, withAlpha } from '@/theme/palette';

const RING_SIZE = 264;
const RING_RADIUS = 118;
const RING_STROKE = 14;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const TICK_MS = 100;

/**
 * Cronómetro del hábito a pantalla completa. No existe en el diseño: se construye con los tokens
 * del sistema (gradiente inmersivo y anillo aguamarina→morado, como el anillo de racha).
 * La cuenta atrás se calcula contra un timestamp de fin, no acumulando ticks, para no desviarse
 * ni perder tiempo mientras el app está en segundo plano.
 */
export function TemporizadorScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const habit = useHabitStore((s) => s.habits.find((h) => h.id === id));
  const toggleDone = useHabitStore((s) => s.toggleDone);
  const doneIds = useDoneIds(todayKey());

  const totalSeconds = parseTimerSeconds(habit?.timerLabel) ?? 0;
  const [remaining, setRemaining] = useState(totalSeconds);
  const [running, setRunning] = useState(true);
  const endsAtRef = useRef<number | null>(null);
  const markedRef = useRef(false);
  const doneRef = useRef(false);
  doneRef.current = habit ? doneIds.includes(habit.id) : false;

  const habitId = habit?.id;

  // Al terminar se marca el hábito una sola vez (y solo si aún no estaba hecho hoy).
  const finish = useCallback(() => {
    if (markedRef.current) return;
    markedRef.current = true;
    if (habitId && !doneRef.current) toggleDone(habitId);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [habitId, toggleDone]);

  // Arranca solo al abrir: se llegó aquí pulsando ▶.
  useEffect(() => {
    if (totalSeconds > 0) endsAtRef.current = Date.now() + totalSeconds * 1000;
  }, [totalSeconds]);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      const endsAt = endsAtRef.current;
      if (endsAt === null) return;
      const left = (endsAt - Date.now()) / 1000;
      if (left <= 0) {
        setRemaining(0);
        setRunning(false);
        endsAtRef.current = null;
        finish();
      } else {
        setRemaining(left);
      }
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [finish, running]);

  const pause = () => {
    endsAtRef.current = null;
    setRunning(false);
  };

  const resume = () => {
    endsAtRef.current = Date.now() + remaining * 1000;
    setRunning(true);
  };

  const restart = () => {
    markedRef.current = false;
    setRemaining(totalSeconds);
    endsAtRef.current = Date.now() + totalSeconds * 1000;
    setRunning(true);
  };

  /** Salida rápida: da el hábito por hecho sin esperar al cronómetro. */
  const skip = () => {
    endsAtRef.current = null;
    setRunning(false);
    finish();
    router.back();
  };

  if (!habit || totalSeconds === 0) return <View className="flex-1 bg-fondo" />;

  const isDone = remaining <= 0;
  const progress = Math.min(1, Math.max(0, 1 - remaining / totalSeconds));

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <LinearGradient
        colors={gradientInmersivo.colors}
        locations={gradientInmersivo.locations}
        start={{ x: 0.37, y: 0 }}
        end={{ x: 0.63, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View className="flex-1 px-7" style={{ paddingTop: Math.max(64, insets.top + 12) }}>
        <View className="flex-row justify-end">
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Cerrar temporizador"
            hitSlop={8}
            className="h-9 w-9 items-center justify-center rounded-full"
            style={{ backgroundColor: withAlpha(palette.blanco, 0.16) }}
          >
            <Text className="text-[15px] text-white">✕</Text>
          </Pressable>
        </View>

        <View className="mt-2 items-center">
          <Text className="text-[44px]">{habit.icon}</Text>
          <Text className="mt-2 text-[22px] font-extrabold tracking-[-0.3px] text-white">
            {habit.name}
          </Text>
          <Text className="mt-1 text-[13px] text-white/[0.6]">{habit.scheduleLabel}</Text>
        </View>

        <View className="flex-1 items-center justify-center">
          <View style={{ width: RING_SIZE, height: RING_SIZE }}>
            <Svg
              width={RING_SIZE}
              height={RING_SIZE}
              viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
              style={{ position: 'absolute', inset: 0, transform: [{ rotate: '-90deg' }] }}
            >
              <Defs>
                <SvgLinearGradient id="timer-ring" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor={palette.aguamarina} />
                  <Stop offset="1" stopColor={palette.morado} />
                </SvgLinearGradient>
              </Defs>
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                fill="none"
                stroke={withAlpha(palette.blanco, 0.14)}
                strokeWidth={RING_STROKE}
              />
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                fill="none"
                stroke="url(#timer-ring)"
                strokeWidth={RING_STROKE}
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress)}
              />
            </Svg>
            <View className="absolute inset-0 items-center justify-center">
              <Text
                className="text-[56px] font-extrabold tracking-[-2px] text-white"
                style={{ fontVariant: ['tabular-nums'] }}
              >
                {formatCountdown(remaining)}
              </Text>
              <Text className="mt-1 text-[13px] font-semibold text-white/[0.6]">
                {isDone ? '✓ hábito completado' : running ? `de ${habit.timerLabel}` : 'en pausa'}
              </Text>
            </View>
          </View>
        </View>

        <View className="gap-4" style={{ paddingBottom: Math.max(insets.bottom, 24) + 20 }}>
          <View className="flex-row items-center gap-3">
            <SecondaryButton label="Reiniciar" onPress={restart} />
            {isDone ? (
              <PrimaryButton label="Listo" onPress={() => router.back()} />
            ) : running ? (
              <PrimaryButton label="Pausar" onPress={pause} />
            ) : (
              <PrimaryButton label="Reanudar" onPress={resume} />
            )}
          </View>
          {isDone ? null : (
            <Pressable
              onPress={skip}
              accessibilityRole="button"
              accessibilityLabel="Saltar y marcar como hecho"
              className="items-center py-1"
            >
              <Text className="text-[13.5px] font-semibold text-white/[0.6]">
                Saltar · marcarlo como hecho ✓
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{ flex: 1.4 }}
      className="h-[58px] items-center justify-center rounded-full bg-white active:opacity-90"
    >
      <Text className="text-[17px] font-extrabold" style={{ color: palette.morado }}>
        {label}
      </Text>
    </Pressable>
  );
}

function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="h-[58px] flex-1 items-center justify-center rounded-full active:opacity-80"
      style={{
        backgroundColor: withAlpha(palette.blanco, 0.14),
        borderWidth: 1,
        borderColor: withAlpha(palette.blanco, 0.3),
      }}
    >
      <Text className="text-[16px] font-bold text-white">{label}</Text>
    </Pressable>
  );
}
