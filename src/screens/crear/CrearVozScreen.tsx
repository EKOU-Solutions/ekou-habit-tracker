import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { MicIcon } from '@/components/icons';
import { PopIn } from '@/components/PopIn';
import { useVoiceCapture } from '@/hooks/useVoiceCapture';
import { FRECUENCIA_LABELS, MOMENTOS } from '@/lib/habitSchedule';
import { interpretSpokenHabit, type VoiceHabit } from '@/lib/voice';
import { IconIASheet } from '@/screens/crear/IconIASheet';
import { useHabitDraftStore } from '@/store/useHabitDraftStore';
import { useHabitStore } from '@/store/useHabitStore';
import { gradientIA, gradientPrincipal, palette, withAlpha } from '@/theme/palette';
import { resultCardShadow, softBadgeShadow, voiceButtonShadow } from '@/theme/shadows';

type Fase = 'escucho' | 'creando' | 'resultado';

const WAVE_HEIGHTS = [18, 34, 48, 28, 44, 22, 38, 16, 30];
// El spinner "creando" se muestra al menos esto para que la interpretación no parpadee.
const MIN_CREANDO_MS = 1400;

/** Crear hábito por voz (2.2a-c): EKOU escucha, procesa y devuelve el hábito interpretado. */
export function CrearVozScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const addHabit = useHabitStore((s) => s.addHabit);
  const { transcript, state, error, volume, start, stop } = useVoiceCapture();
  const [fase, setFase] = useState<Fase>('escucho');
  const [result, setResult] = useState<VoiceHabit | null>(null);
  const [showIASheet, setShowIASheet] = useState(false);
  const transcriptRef = useRef('');
  transcriptRef.current = transcript;

  // Empezar a escuchar al abrir la pantalla y volver a hacerlo al re-dictar.
  useEffect(() => {
    if (fase === 'escucho') void start();
  }, [fase, start]);

  const handleFinish = () => {
    stop();
    setFase('creando');
    const startedAt = Date.now();
    void (async () => {
      const spoken = transcriptRef.current.trim();
      const habit = spoken.length > 0 ? await interpretSpokenHabit(spoken) : null;
      const wait = Math.max(0, MIN_CREANDO_MS - (Date.now() - startedAt));
      setTimeout(() => {
        if (habit) {
          setResult(habit);
          setFase('resultado');
        } else {
          setFase('escucho');
        }
      }, wait);
    })();
  };

  const handleCreate = () => {
    if (!result) return;
    addHabit({
      id: `habito-${Date.now()}`,
      name: result.name,
      icon: result.icon,
      scheduleLabel: result.scheduleLabel,
      isPriority: false,
      frequency: result.frequency,
      days: result.days,
      moment: result.moment ?? undefined,
      reminder: result.reminder,
      timerLabel: result.timerLabel,
    });
    router.back();
  };

  // "Editar" abre la pantalla de edición precargada con lo dictado, sin crear el hábito todavía.
  // El borrador viaja por un store en memoria (no por la URL: en web la query con emoji rompía la navegación).
  const handleEdit = () => {
    if (!result) return;
    useHabitDraftStore.getState().setDraft(result);
    router.replace('/editar/nuevo');
  };

  const quoteText =
    transcript.trim().length > 0
      ? transcript.trim()
      : state === 'error'
        ? (error ?? 'No pude escucharte')
        : 'Dime tu hábito…';

  return (
    <View className="flex-1 bg-fondo">
      <LinearGradient
        colors={[withAlpha(palette.morado, 0.09), withAlpha(palette.aguamarina, 0.04), withAlpha(palette.aguamarina, 0)]}
        locations={[0, 0.6, 1]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        className="absolute bottom-0 left-0 right-0 h-[340px]"
      />
      <View className="flex-1 px-7" style={{ paddingTop: Math.max(82, insets.top + 23) }}>
        <View className="flex-row justify-end">
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
            hitSlop={8}
            className="h-9 w-9 items-center justify-center rounded-full bg-white"
            style={softBadgeShadow}
          >
            <Text className="text-[15px] text-gris-600">✕</Text>
          </Pressable>
        </View>

        <View className="flex-1 pt-[60px]">
          <Text
            className="mt-[26px] text-center text-xs font-bold tracking-[0.14em]"
            style={{ color: fase === 'resultado' ? palette.tealProfundo : palette.morado }}
          >
            {fase === 'creando'
              ? 'CREANDO TU HÁBITO…'
              : fase === 'resultado'
                ? '✓ LISTO — ESTO ENTENDÍ'
                : 'TE ESCUCHO…'}
          </Text>

          <View className="mt-3.5 h-[76px] items-center justify-center">
            {fase === 'escucho' ? <WaveForm volume={volume} /> : null}
            {fase === 'creando' ? <BreathingOrb /> : null}
          </View>

          <Quote text={quoteText} dimmed={fase !== 'escucho'} />

          {fase === 'creando' ? <CreandoSteps /> : null}
          {fase === 'resultado' && result ? (
            <ResultadoCard
              habit={result}
              onCreate={handleCreate}
              onEdit={handleEdit}
              onIconPress={() => setShowIASheet(true)}
            />
          ) : null}
        </View>

        <View
          className="items-center gap-[18px]"
          style={{ paddingBottom: Math.max(52, insets.bottom + 20) }}
        >
          <View className="h-[84px] items-center justify-center">
            {fase === 'escucho' ? (
              <Pressable onPress={handleFinish} accessibilityRole="button" accessibilityLabel="Terminar dictado">
                <PulsingMic recording={state === 'listening'} />
              </Pressable>
            ) : null}
            {fase === 'creando' ? (
              <View className="h-[84px] w-[84px] items-center justify-center rounded-full bg-gris-250 opacity-70">
                <MicIcon color={palette.gris400} size={32} />
                <Text className="absolute -bottom-[22px] text-[11.5px] font-semibold text-gris-400">
                  Procesando…
                </Text>
              </View>
            ) : null}
            {fase === 'resultado' ? (
              <Pressable
                onPress={() => setFase('escucho')}
                accessibilityRole="button"
                className="flex-row items-center gap-2 rounded-3xl bg-white px-5 py-3"
                style={softBadgeShadow}
              >
                <MicIcon color={palette.morado} size={16} />
                <Text className="text-[14.5px] font-bold text-morado">Volver a dictarlo</Text>
              </Pressable>
            ) : null}
          </View>
          <Pressable onPress={() => router.replace('/crear/texto')} accessibilityRole="button">
            <Text className="text-[13.5px] font-semibold text-gris-500">
              ¿No te entiende? <Text className="text-morado">Escríbelo a mano</Text>
            </Text>
          </Pressable>
        </View>
      </View>

      {showIASheet && result ? (
        <IconIASheet
          habitName={result.name}
          onPick={(picked) => {
            setResult({ ...result, icon: picked });
            setShowIASheet(false);
          }}
          onClose={() => setShowIASheet(false)}
        />
      ) : null}
    </View>
  );
}

const QUOTE_TEXT_CLASS = 'text-center text-[21px] font-bold leading-[29px] tracking-[-0.3px]';

/**
 * La frase dictada en vivo, en gradiente. Dos capas con métrica idéntica: la base deja el texto
 * transparente y encima va el gradiente enmascarado por esos glifos. En la máscara el texto usa
 * marino: en nativo solo importa el alfa; en web (donde masked-view no enmascara) se ve marino,
 * el mismo fallback que GradientText, no negro.
 */
function Quote({ text, dimmed }: { text: string; dimmed: boolean }) {
  const quoted = `«${text}»`;
  return (
    <View className="mt-[18px] min-h-[60px]" style={{ opacity: dimmed ? 0.55 : 1 }}>
      <Text className={`${QUOTE_TEXT_CLASS} text-transparent`}>{quoted}</Text>
      <View className="absolute inset-0" pointerEvents="none">
        <MaskedView
          style={{ flex: 1 }}
          maskElement={<Text className={`${QUOTE_TEXT_CLASS} text-marino`}>{quoted}</Text>}
        >
          <LinearGradient colors={gradientIA} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }} />
        </MaskedView>
      </View>
    </View>
  );
}

// Factor por barra: las del centro reaccionan más fuerte a la voz que las de los bordes.
const WAVE_FACTORS = [0.5, 0.7, 0.9, 1, 1, 0.85, 0.75, 0.55, 0.65];

function WaveForm({ volume }: { volume: SharedValue<number> }) {
  return (
    <View className="flex-row items-center gap-1">
      {WAVE_HEIGHTS.map((height, i) => (
        <WaveBar key={i} height={height} delayMs={i * 80} factor={WAVE_FACTORS[i]} volume={volume} />
      ))}
    </View>
  );
}

/**
 * Barra de la onda: una respiración base sutil (para que no se vea muerta en silencio)
 * amplificada por el volumen real del micrófono, así la onda reacciona a lo que dice el usuario.
 */
function WaveBar({
  height,
  delayMs,
  factor,
  volume,
}: {
  height: number;
  delayMs: number;
  factor: number;
  volume: SharedValue<number>;
}) {
  const idle = useSharedValue(0.35);

  useEffect(() => {
    idle.value = withDelay(
      delayMs,
      withRepeat(withTiming(0.6, { duration: 620, easing: Easing.inOut(Easing.ease) }), -1, true),
    );
  }, [delayMs, idle]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: Math.min(1, idle.value * 0.5 + volume.value * factor) }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <LinearGradient
        colors={gradientIA}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        className="w-1 rounded-sm"
        style={{ height }}
      />
    </Animated.View>
  );
}

function BreathingOrb() {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 550, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 550, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={animatedStyle}>
      {/* Halo exterior (box-shadow spread del diseño: 0 0 0 10px rgba(45,204,211,.1)). */}
      <View
        className="absolute rounded-full"
        style={{ top: -10, left: -10, right: -10, bottom: -10, backgroundColor: withAlpha(palette.aguamarina, 0.1) }}
      />
      <LinearGradient
        colors={[palette.aguamarina, palette.marino, palette.morado]}
        locations={[0, 0.55, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="h-[52px] w-[52px] rounded-full"
        style={{
          shadowColor: palette.morado,
          shadowOpacity: 0.35,
          shadowRadius: 26,
          shadowOffset: { width: 0, height: 10 },
          elevation: 8,
        }}
      />
    </Animated.View>
  );
}

function CreandoSteps() {
  return (
    <View className="mt-5 items-center gap-[9px]">
      <View className="flex-row items-center gap-[9px]">
        <View
          className="h-[18px] w-[18px] items-center justify-center rounded-full"
          style={{ backgroundColor: withAlpha(palette.aguamarina, 0.16) }}
        >
          <Svg width={9} height={7} viewBox="0 0 12 10">
            <Path
              d="M1 5l3.5 3.5L11 1"
              stroke={palette.tealProfundo}
              strokeWidth={2.2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
        <Text className="text-[13px] font-semibold text-teal-profundo">Entendí lo que dijiste</Text>
      </View>
      <View className="flex-row items-center gap-[9px]">
        <Spinner />
        <Text className="text-[13px] font-semibold text-tinta">Eligiendo ícono y horario…</Text>
      </View>
    </View>
  );
}

function Spinner() {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 700, easing: Easing.linear }), -1);
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View
      style={[
        {
          height: 18,
          width: 18,
          borderRadius: 9,
          borderWidth: 2,
          borderColor: palette.pista,
          borderTopColor: palette.morado,
        },
        animatedStyle,
      ]}
    />
  );
}

function ResultadoCard({
  habit,
  onCreate,
  onEdit,
  onIconPress,
}: {
  habit: VoiceHabit;
  onCreate: () => void;
  onEdit: () => void;
  onIconPress: () => void;
}) {
  const momento = habit.moment ? MOMENTOS.find((m) => m.id === habit.moment) : null;
  const frecuenciaLabel =
    habit.frequency === 'dias' && habit.days.length > 0
      ? habit.days.join(' · ')
      : FRECUENCIA_LABELS[habit.frequency];
  return (
    <>
      <PopIn>
        <View className="mt-4 rounded-[24px] bg-white p-[18px]" style={resultCardShadow}>
          <View className="flex-row items-center gap-[13px]">
            <Pressable
              onPress={onIconPress}
              accessibilityRole="button"
              accessibilityLabel="Cambiar el ícono"
              className="relative h-[50px] w-[50px] items-center justify-center rounded-2xl bg-gris-100"
            >
              <Text className="text-[25px]">{habit.icon}</Text>
              <LinearGradient
                colors={gradientIA}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="absolute -right-1.5 -top-1.5 h-5 w-5 items-center justify-center rounded-full"
              >
                <Text className="text-[10px]">✨</Text>
              </LinearGradient>
            </Pressable>
            <View className="flex-1">
              <Text className="text-[17px] font-bold text-tinta">{habit.name}</Text>
              <View className="mt-1.5 flex-row flex-wrap gap-1.5">
                <Text className="rounded-xl bg-aguamarina/[0.16] px-[9px] py-1 text-[11.5px] font-bold text-teal-profundo">
                  {frecuenciaLabel}
                </Text>
                {momento ? (
                  <Text className="rounded-xl bg-morado/[0.09] px-[9px] py-1 text-[11.5px] font-bold text-morado">
                    {momento.emoji} {momento.label}
                  </Text>
                ) : null}
                {habit.timerLabel ? (
                  <Text className="rounded-xl bg-gris-100 px-[9px] py-1 text-[11.5px] font-bold text-gris-600">
                    ⏱ {habit.timerLabel}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>
          <View className="mt-4 flex-row gap-2.5">
            <Pressable
              onPress={onEdit}
              accessibilityRole="button"
              accessibilityLabel="Editar antes de crear"
              className="h-[46px] flex-1 items-center justify-center rounded-full bg-gris-100"
            >
              <Text className="text-[15px] font-semibold text-tinta">Editar</Text>
            </Pressable>
            <Pressable onPress={onCreate} accessibilityRole="button" style={{ flex: 1.6 }}>
              <LinearGradient
                colors={gradientPrincipal}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="h-[46px] items-center justify-center rounded-full"
              >
                <Text className="text-[15px] font-bold text-white">Crear hábito ✓</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </PopIn>
      <Text className="mt-3.5 text-center text-[12.5px] text-gris-500">
        Frecuencia y horario se pueden cambiar cuando quieras
      </Text>
    </>
  );
}

/** Botón de dictado: mic mientras arranca, y un cuadro "stop" pulsante mientras graba. */
function PulsingMic({ recording }: { recording: boolean }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={animatedStyle}>
      {/* Halo exterior (box-shadow spread del diseño: 0 0 0 12px rgba(175,15,125,.08)). */}
      <View
        className="absolute rounded-full"
        style={{ top: -12, left: -12, right: -12, bottom: -12, backgroundColor: withAlpha(palette.morado, 0.08) }}
      />
      <LinearGradient
        colors={gradientPrincipal}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="h-[84px] w-[84px] items-center justify-center rounded-full"
        style={voiceButtonShadow}
      >
        {recording ? (
          <View className="h-[26px] w-[26px] rounded-lg bg-white" />
        ) : (
          <MicIcon color={palette.blanco} size={32} />
        )}
      </LinearGradient>
    </Animated.View>
  );
}
