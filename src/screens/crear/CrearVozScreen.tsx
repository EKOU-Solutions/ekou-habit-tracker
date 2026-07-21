import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { MicIcon } from '@/components/icons';
import { PopIn } from '@/components/PopIn';
import { useHabitStore } from '@/store/useHabitStore';
import { gradientIA, gradientPrincipal, palette, withAlpha } from '@/theme/palette';
import { resultCardShadow, softBadgeShadow, voiceButtonShadow } from '@/theme/shadows';

type Fase = 'escucho' | 'creando' | 'resultado';

// TODO(voz): dictado y parseo reales (requiere STT nativo, fuera del stack actual); demo fiel a 2.2a-c.
const DEMO_HABIT = { name: 'Meditar', icon: '🧘', quote: 'meditar 10 minutos cada noche' };
const WAVE_HEIGHTS = [18, 34, 48, 28, 44, 22, 38, 16, 30];
const CREANDO_MS = 2200;

/** Crear hábito por voz (2.2a-c): EKOU escucha, procesa y devuelve el hábito interpretado. */
export function CrearVozScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const addHabit = useHabitStore((s) => s.addHabit);
  const [fase, setFase] = useState<Fase>('escucho');

  useEffect(() => {
    if (fase !== 'creando') return;
    const timer = setTimeout(() => setFase('resultado'), CREANDO_MS);
    return () => clearTimeout(timer);
  }, [fase]);

  const handleCreate = () => {
    addHabit({
      id: `habito-${Date.now()}`,
      name: DEMO_HABIT.name,
      icon: DEMO_HABIT.icon,
      scheduleLabel: 'Todos los días · noche',
      isPriority: false,
      frequency: 'diario',
      days: [],
      moment: 'noche',
      reminder: true,
    });
    router.back();
  };

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
            {fase === 'escucho' ? <WaveForm /> : null}
            {fase === 'creando' ? <BreathingOrb /> : null}
          </View>

          <Quote dimmed={fase !== 'escucho'} />

          {fase === 'creando' ? <CreandoSteps /> : null}
          {fase === 'resultado' ? (
            <ResultadoCard onCreate={handleCreate} onEdit={() => router.replace('/crear/texto')} />
          ) : null}
        </View>

        <View
          className="items-center gap-[18px]"
          style={{ paddingBottom: Math.max(52, insets.bottom + 20) }}
        >
          <View className="h-[84px] items-center justify-center">
            {fase === 'escucho' ? (
              <Pressable onPress={() => setFase('creando')} accessibilityRole="button" accessibilityLabel="Terminar dictado">
                <PulsingMic />
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
    </View>
  );
}

const QUOTE_TEXT_CLASS = 'text-center text-[21px] font-bold leading-[29px] tracking-[-0.3px]';

/**
 * La frase dictada con el tramo del hábito en gradiente. Dos capas con métrica idéntica:
 * la base deja el tramo transparente y encima va el gradiente enmascarado solo por esos glifos
 * (un MaskedView inline dentro de Text no fluye con el salto de línea). El tramo en la máscara
 * usa marino: en nativo solo importa el alfa; en web (donde masked-view no enmascara) se ve marino,
 * el mismo fallback que GradientText, no negro.
 */
function Quote({ dimmed }: { dimmed: boolean }) {
  return (
    <View className="mt-[18px] min-h-[60px]" style={{ opacity: dimmed ? 0.55 : 1 }}>
      <Text className={`${QUOTE_TEXT_CLASS} text-tinta`}>
        «EKOU, quiero <Text className="text-transparent">{DEMO_HABIT.quote}</Text>»
      </Text>
      <View className="absolute inset-0" pointerEvents="none">
        <MaskedView
          style={{ flex: 1 }}
          maskElement={
            <Text className={`${QUOTE_TEXT_CLASS} text-transparent`}>
              «EKOU, quiero <Text className="text-marino">{DEMO_HABIT.quote}</Text>»
            </Text>
          }
        >
          <LinearGradient
            colors={gradientIA}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
          />
        </MaskedView>
      </View>
    </View>
  );
}

function WaveForm() {
  return (
    <View className="flex-row items-center gap-1">
      {WAVE_HEIGHTS.map((height, i) => (
        <WaveBar key={i} height={height} delayMs={i * 80} />
      ))}
    </View>
  );
}

function WaveBar({ height, delayMs }: { height: number; delayMs: number }) {
  const scaleY = useSharedValue(0.25);

  useEffect(() => {
    scaleY.value = withDelay(
      delayMs,
      withRepeat(withTiming(1, { duration: 550, easing: Easing.inOut(Easing.ease) }), -1, true),
    );
  }, [delayMs, scaleY]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: scaleY.value }] }));

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

function ResultadoCard({ onCreate, onEdit }: { onCreate: () => void; onEdit: () => void }) {
  return (
    <>
      <PopIn>
        <View className="mt-4 rounded-[24px] bg-white p-[18px]" style={resultCardShadow}>
          <View className="flex-row items-center gap-[13px]">
            <View className="relative h-[50px] w-[50px] items-center justify-center rounded-2xl bg-gris-100">
              <Text className="text-[25px]">{DEMO_HABIT.icon}</Text>
              <LinearGradient
                colors={gradientIA}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="absolute -right-1.5 -top-1.5 h-5 w-5 items-center justify-center rounded-full"
              >
                <Text className="text-[10px]">✨</Text>
              </LinearGradient>
            </View>
            <View className="flex-1">
              <Text className="text-[17px] font-bold text-tinta">{DEMO_HABIT.name}</Text>
              <View className="mt-1.5 flex-row gap-1.5">
                <Text className="rounded-xl bg-aguamarina/[0.16] px-[9px] py-1 text-[11.5px] font-bold text-teal-profundo">
                  Todos los días
                </Text>
                <Text className="rounded-xl bg-morado/[0.09] px-[9px] py-1 text-[11.5px] font-bold text-morado">
                  🌙 Noche
                </Text>
                <Text className="rounded-xl bg-gris-100 px-[9px] py-1 text-[11.5px] font-bold text-gris-600">
                  ⏱ 10 min
                </Text>
              </View>
            </View>
          </View>
          <View className="mt-4 flex-row gap-2.5">
            <Pressable
              onPress={onEdit}
              accessibilityRole="button"
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

function PulsingMic() {
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
        <MicIcon color={palette.blanco} size={32} />
      </LinearGradient>
    </Animated.View>
  );
}
