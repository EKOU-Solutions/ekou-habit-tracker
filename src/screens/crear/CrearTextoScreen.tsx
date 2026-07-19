import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { PopIn } from '@/components/PopIn';
import { DAY_LETTERS } from '@/lib/dates';
import { IconIASheet } from '@/screens/crear/IconIASheet';
import { StepperHeader } from '@/screens/crear/StepperHeader';
import { useHabitStore } from '@/store/useHabitStore';
import { gradientIA, gradientPrincipal, palette } from '@/theme/palette';
import {
  crearCtaShadow,
  iconTileShadow,
  knobShadow,
  optionSelectedShadow,
  panelShadow,
} from '@/theme/shadows';

type Frecuencia = 'diario' | 'semana' | 'dias';
type Momento = 'manana' | 'tarde' | 'noche';

const FRECUENCIA_LABELS: Record<Frecuencia, string> = {
  diario: 'Todos los días',
  semana: 'Entre semana',
  dias: 'Días elegidos',
};
const MOMENTOS: { id: Momento; emoji: string; label: string; reminder: string }[] = [
  { id: 'manana', emoji: '☀️', label: 'Mañana', reminder: '08:00 · sugerido para la mañana' },
  { id: 'tarde', emoji: '🌤️', label: 'Tarde', reminder: '15:00 · sugerido para la tarde' },
  { id: 'noche', emoji: '🌙', label: 'Noche', reminder: '21:00 · sugerido para la noche' },
];

/** Crear hábito por texto (2.1a-e): stepper nombre+ícono → frecuencia → horario+recordatorio. */
export function CrearTextoScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const addHabit = useHabitStore((s) => s.addHabit);
  const nameRef = useRef<TextInput>(null);

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🧘');
  const [showIASheet, setShowIASheet] = useState(false);
  const [frecuencia, setFrecuencia] = useState<Frecuencia | null>(null);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [momento, setMomento] = useState<Momento | null>(null);
  const [reminder, setReminder] = useState(true);

  const canContinue = name.trim().length > 0;

  // Días en orden L–D, no en orden de pulsación.
  const daysInWeekOrder = DAY_LETTERS.filter((d) => selectedDays.includes(d));

  const createHabit = () => {
    const parts = [
      frecuencia === 'dias' && daysInWeekOrder.length > 0
        ? daysInWeekOrder.join(' · ')
        : FRECUENCIA_LABELS[frecuencia ?? 'diario'],
      momento ? MOMENTOS.find((m) => m.id === momento)?.label.toLowerCase() : null,
    ].filter(Boolean);
    addHabit({
      id: `habito-${Date.now()}`,
      name: name.trim(),
      icon,
      scheduleLabel: parts.join(' · '),
      isPriority: false,
    });
    router.back();
  };

  const handleContinue = () => {
    if (!canContinue) return;
    if (step < 2) setStep(step + 1);
    else createHabit();
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    else router.back();
  };

  return (
    <View className="flex-1 bg-fondo">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <View className="flex-1 px-7" style={{ paddingTop: Math.max(70, insets.top + 14) }}>
          <StepperHeader step={step} onBack={handleBack} />

          <StepTrack step={step} width={width}>
            <StepPage width={width}>
              <View className="relative mb-6 h-[92px] w-[92px] items-center justify-center rounded-[28px] bg-white" style={iconTileShadow}>
                <Text className="text-[46px]">{icon}</Text>
                <LinearGradient
                  colors={gradientIA}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="absolute -right-2 -top-2 h-7 w-7 items-center justify-center rounded-full"
                >
                  <Text className="text-sm">✨</Text>
                </LinearGradient>
              </View>
              <Text className="mb-2 text-[15px] font-semibold text-gris-500">
                ¿Qué hábito quieres crear?
              </Text>
              <Pressable onPress={() => nameRef.current?.focus()} className="w-full items-center">
                <TextInput
                  ref={nameRef}
                  value={name}
                  onChangeText={setName}
                  placeholder="Meditar"
                  placeholderTextColor={palette.gris300}
                  selectionColor={palette.morado}
                  autoFocus
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={handleContinue}
                  textAlign="center"
                  className="h-11 min-w-[200px] max-w-full self-stretch py-0 text-center text-[30px] font-extrabold tracking-[-0.5px] text-tinta"
                />
                <View className="mt-1 h-[2px] w-32 rounded-full bg-pista" />
              </Pressable>
              <Pressable
                onPress={() => setShowIASheet(true)}
                accessibilityRole="button"
                className="mt-3.5 flex-row items-center gap-1.5 rounded-[18px] bg-white px-[13px] py-2"
                style={panelShadow}
              >
                <Text className="text-[12.5px] font-bold text-morado">✨ Generar ícono con IA</Text>
              </Pressable>
            </StepPage>

            <StepPage width={width}>
              <Text className="mb-[18px] text-[15px] font-semibold text-gris-500">
                ¿Cada cuánto? <Text className="text-gris-300">· opcional</Text>
              </Text>
              <View className="w-full gap-2.5">
                {(Object.keys(FRECUENCIA_LABELS) as Frecuencia[]).map((f) => (
                  <FrecuenciaOption
                    key={f}
                    label={f === 'dias' ? 'Elegir días' : FRECUENCIA_LABELS[f]}
                    selected={frecuencia === f}
                    onPress={() => setFrecuencia(frecuencia === f ? null : f)}
                  />
                ))}
              </View>
              {frecuencia === 'dias' ? (
                <PopIn className="w-full">
                  <View className="mt-3.5 w-full rounded-[22px] bg-white px-3.5 py-4" style={panelShadow}>
                    <View className="flex-row justify-between gap-1.5">
                      {DAY_LETTERS.map((d) => (
                        <DayCircle
                          key={d}
                          letter={d}
                          selected={selectedDays.includes(d)}
                          onPress={() =>
                            setSelectedDays((prev) =>
                              prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
                            )
                          }
                        />
                      ))}
                    </View>
                    <Text className="mt-3 text-xs text-gris-500">
                      {daysInWeekOrder.length > 0
                        ? `Toca los días que aplican · ${daysInWeekOrder.join(' · ')}`
                        : 'Toca los días que aplican'}
                    </Text>
                  </View>
                </PopIn>
              ) : null}
            </StepPage>

            <StepPage width={width}>
              <Text className="mb-[18px] text-[15px] font-semibold text-gris-500">
                ¿En qué momento? <Text className="text-gris-300">· opcional</Text>
              </Text>
              <View className="w-full flex-row gap-2.5">
                {MOMENTOS.map((m) => (
                  <MomentoCard
                    key={m.id}
                    momento={m}
                    selected={momento === m.id}
                    onPress={() => setMomento(momento === m.id ? null : m.id)}
                  />
                ))}
              </View>
              <View className="mt-4 w-full flex-row items-center gap-3 rounded-[18px] bg-white px-3.5 py-[13px]" style={panelShadow}>
                <View className="h-[38px] w-[38px] items-center justify-center rounded-[13px] bg-gris-100">
                  <Text className="text-lg">🔔</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-[14.5px] font-bold text-tinta">Recordatorio</Text>
                  <Text className="mt-px text-xs text-gris-500">
                    {MOMENTOS.find((m) => m.id === momento)?.reminder ?? '21:00 · sugerido para la noche'}
                  </Text>
                </View>
                <Toggle value={reminder} onToggle={() => setReminder(!reminder)} />
              </View>
              <Text className="mt-3 text-center text-xs leading-[18px] text-gris-500">
                El momento agrupa el hábito en tu día; el recordatorio es una alerta puntual
                opcional — puedes usar ambos.
              </Text>
            </StepPage>
          </StepTrack>

          <View
            className="items-center gap-3.5"
            style={{ paddingBottom: Math.max(52, insets.bottom + 20) }}
          >
            <Pressable
              onPress={handleContinue}
              disabled={!canContinue}
              accessibilityRole="button"
              className="w-full"
            >
              <LinearGradient
                colors={gradientPrincipal}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="h-14 flex-row items-center justify-center gap-2 rounded-full"
                style={[crearCtaShadow, !canContinue && { opacity: 0.5 }]}
              >
                <Text className="text-[17px] font-bold text-white">
                  {step === 2 ? 'Crear hábito ✓' : 'Continuar'}
                </Text>
                {step < 2 ? <Text className="text-base text-white">→</Text> : null}
              </LinearGradient>
            </Pressable>
            <Pressable onPress={createHabit} disabled={!canContinue} accessibilityRole="button">
              <Text className="text-[13px] text-gris-500">Saltar — con el nombre basta</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      {showIASheet ? (
        <IconIASheet
          habitName={name.trim() || 'Meditar'}
          onPick={(picked) => {
            setIcon(picked);
            setShowIASheet(false);
          }}
          onClose={() => setShowIASheet(false)}
        />
      ) : null}
    </View>
  );
}

/** Pista horizontal de 3 páginas (transform del diseño: .55s cubic-bezier(.22,1,.36,1)). */
function StepTrack({ step, width, children }: { step: number; width: number; children: React.ReactNode }) {
  const translateX = useSharedValue(0);

  useEffect(() => {
    translateX.value = withTiming(-step * width, {
      duration: 550,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });
  }, [step, translateX, width]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View className="-mx-7 flex-1 overflow-hidden">
      <Animated.View className="h-full flex-row" style={[{ width: width * 3 }, animatedStyle]}>
        {children}
      </Animated.View>
    </View>
  );
}

function StepPage({ width, children }: { width: number; children: React.ReactNode }) {
  return (
    <View className="h-full items-center justify-center px-7" style={{ width }}>
      {children}
    </View>
  );
}

function FrecuenciaOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  if (selected) {
    return (
      <Pressable onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected }}>
        <LinearGradient
          colors={gradientPrincipal}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="h-[54px] items-center justify-center rounded-[27px]"
          style={optionSelectedShadow}
        >
          <Text className="text-[15.5px] font-bold text-white">{label}</Text>
        </LinearGradient>
      </Pressable>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      className="h-[54px] items-center justify-center rounded-[27px] bg-white"
      style={panelShadow}
    >
      <Text className="text-[15.5px] font-semibold text-gris-600">{label}</Text>
    </Pressable>
  );
}

function DayCircle({
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

function MomentoCard({
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

function Toggle({ value, onToggle }: { value: boolean; onToggle: () => void }) {
  if (value) {
    return (
      <Pressable onPress={onToggle} accessibilityRole="switch" accessibilityState={{ checked: value }}>
        <LinearGradient
          colors={gradientPrincipal}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="h-7 w-[46px] justify-center rounded-full"
        >
          <View
            className="absolute right-[3px] h-[22px] w-[22px] rounded-full bg-white"
            style={knobShadow}
          />
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
      <View
        className="absolute left-[3px] h-[22px] w-[22px] rounded-full bg-white"
        style={knobShadow}
      />
    </Pressable>
  );
}
