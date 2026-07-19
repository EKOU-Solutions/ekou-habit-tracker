import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, type ReactNode } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

import { GradientText } from '@/components/GradientText';
import { gradientPrincipal, palette, withAlpha } from '@/theme/palette';

const RING_SIZE = 206;
const RING_RADIUS = 90;
const RING_STROKE = 13;
const RING_CIRCUMFERENCE = 565; // 2πr redondeado, igual al valor del SVG de diseño (Componentes.dc.html)
const RING_CENTER = RING_SIZE / 2;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface RachaRingProps {
  streakDays: number;
  checkedCount: number;
  totalCount: number;
}

/** Anillo de racha de Home (1.2b-d): riesgo, asegurada o día completo, según los hábitos marcados hoy. */
export function RachaRing({ streakDays, checkedCount, totalCount }: RachaRingProps) {
  const isRiesgo = checkedCount === 0;
  const isCompleto = !isRiesgo && checkedCount >= totalCount;

  const ring = (
    <View style={{ width: RING_SIZE, height: RING_SIZE }}>
      {isRiesgo ? <RiesgoGlow /> : null}
      <Svg
        width={RING_SIZE}
        height={RING_SIZE}
        viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
        style={{ position: 'absolute', inset: 0, transform: [{ rotate: '-90deg' }] }}
      >
        <Defs>
          <SvgLinearGradient id="racha-ring" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={palette.aguamarina} />
            <Stop offset="1" stopColor={palette.morado} />
          </SvgLinearGradient>
        </Defs>
        {isRiesgo ? (
          <>
            <Circle
              cx={RING_CENTER}
              cy={RING_CENTER}
              r={RING_RADIUS}
              fill="none"
              stroke={palette.anilloTrackRiesgo}
              strokeWidth={RING_STROKE}
              strokeDasharray="3 9"
              strokeLinecap="round"
            />
            <RiesgoBlinkArc />
          </>
        ) : (
          <>
            <Circle
              cx={RING_CENTER}
              cy={RING_CENTER}
              r={RING_RADIUS}
              fill="none"
              stroke={palette.anilloTrack}
              strokeWidth={RING_STROKE}
            />
            <ProgressArc progress={checkedCount / totalCount} />
          </>
        )}
      </Svg>
      <View className="absolute inset-0 items-center justify-center gap-0.5">
        {isRiesgo ? (
          <RiesgoCenter streakDays={streakDays} />
        ) : (
          <ProgresoCenter
            streakDays={streakDays}
            checkedCount={checkedCount}
            totalCount={totalCount}
            isCompleto={isCompleto}
          />
        )}
      </View>
    </View>
  );

  return isCompleto ? <PopIn>{ring}</PopIn> : ring;
}

/** riskPulse del diseño: box-shadow que se expande no anima en Android; anillo que crece y se desvanece. */
function RiesgoGlow() {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.out(Easing.ease) }),
      -1,
      false,
    );
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + progress.value * 0.1 }],
    opacity: 1 - progress.value,
  }));

  return (
    <Animated.View
      className="absolute rounded-full border-8"
      style={[
        { top: 6, left: 6, right: 6, bottom: 6, borderColor: withAlpha(palette.morado, 0.28) },
        animatedStyle,
      ]}
    />
  );
}

function RiesgoBlinkArc() {
  const progress = useSharedValue(1);

  useEffect(() => {
    progress.value = withRepeat(
      withSequence(
        withTiming(0.45, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({ opacity: progress.value }));

  return (
    <AnimatedCircle
      cx={RING_CENTER}
      cy={RING_CENTER}
      r={RING_RADIUS}
      fill="none"
      stroke={palette.morado}
      strokeWidth={RING_STROKE}
      strokeLinecap="round"
      strokeDasharray="14 551"
      animatedProps={animatedProps}
    />
  );
}

function ProgressArc({ progress }: { progress: number }) {
  const animated = useSharedValue(progress);

  useEffect(() => {
    animated.value = withTiming(progress, {
      duration: 900,
      easing: Easing.bezier(0.5, 0, 0.2, 1),
    });
  }, [animated, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: RING_CIRCUMFERENCE * (1 - animated.value),
  }));

  return (
    <AnimatedCircle
      cx={RING_CENTER}
      cy={RING_CENTER}
      r={RING_RADIUS}
      fill="none"
      stroke="url(#racha-ring)"
      strokeWidth={RING_STROKE}
      strokeLinecap="round"
      strokeDasharray={RING_CIRCUMFERENCE}
      animatedProps={animatedProps}
    />
  );
}

function RiesgoCenter({ streakDays }: { streakDays: number }) {
  return (
    <>
      <Text style={{ fontSize: 40, lineHeight: 44 }}>🔥</Text>
      <Text className="mt-[5px] text-[15px] font-extrabold text-morado">Racha en riesgo</Text>
      <Text className="mt-0.5 max-w-[140px] text-center text-xs font-medium leading-[16px] text-gris-600">
        1 hábito y salvas tus {streakDays} días
      </Text>
    </>
  );
}

function ProgresoCenter({
  streakDays,
  checkedCount,
  totalCount,
  isCompleto,
}: {
  streakDays: number;
  checkedCount: number;
  totalCount: number;
  isCompleto: boolean;
}) {
  return (
    <>
      <GradientText className="text-[58px] font-extrabold tracking-[-2px]">
        {String(streakDays)}
      </GradientText>
      <Text className="text-[13px] font-medium text-gris-600">días de racha</Text>
      {isCompleto ? (
        <LinearGradient
          colors={gradientPrincipal}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="mt-1 rounded-full px-3 py-[3px]"
        >
          <Text className="text-xs font-extrabold text-white">día perfecto ✦</Text>
        </LinearGradient>
      ) : (
        <View className="mt-1 rounded-full bg-aguamarina/[0.16] px-[11px] py-[3px]">
          <Text className="text-xs font-bold text-teal-profundo">
            ✓ asegurada · {checkedCount} de {totalCount}
          </Text>
        </View>
      )}
    </>
  );
}

function PopIn({ children }: { children: ReactNode }) {
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.12, { duration: 420, easing: Easing.out(Easing.ease) }),
      withTiming(1, { duration: 180, easing: Easing.inOut(Easing.ease) }),
    );
    opacity.value = withTiming(1, { duration: 300 });
  }, [opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}
