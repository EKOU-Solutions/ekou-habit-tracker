import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

import { gradientPrincipal, palette } from '@/theme/palette';
import { todayGlowShadow } from '@/theme/shadows';

export type DayKind =
  | { type: 'blank' }
  | { type: 'off'; day: number }
  | { type: 'future'; day: number }
  | { type: 'fail'; day: number }
  | { type: 'today'; day: number }
  | { type: 'pct'; day: number; pct: number };

const RING_SIZE = 40;
const RING_RADIUS = 17.5;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/** Mini-anillo de cumplimiento de un día del calendario (3a). */
export function DayRing({ kind }: { kind: DayKind }) {
  if (kind.type === 'blank') return <View style={{ width: RING_SIZE, height: RING_SIZE }} />;

  if (kind.type === 'off' || kind.type === 'future') {
    return (
      <View className="h-10 w-10 items-center justify-center">
        <Text className="text-[13px] text-gris-300">{kind.day}</Text>
      </View>
    );
  }

  if (kind.type === 'fail') {
    return (
      <View className="h-10 w-10 items-center justify-center rounded-full bg-gris-150">
        <View className="h-[30px] w-[30px] items-center justify-center rounded-full bg-white">
          <Text className="text-[13px] font-semibold text-morado-claro">{kind.day}</Text>
        </View>
      </View>
    );
  }

  if (kind.type === 'today') {
    return (
      <LinearGradient
        colors={gradientPrincipal}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="h-10 w-10 items-center justify-center rounded-full"
        style={todayGlowShadow}
      >
        <Text className="text-[13px] font-bold text-white">{kind.day}</Text>
      </LinearGradient>
    );
  }

  return (
    <View className="h-10 w-10 items-center justify-center">
      <Svg
        width={RING_SIZE}
        height={RING_SIZE}
        viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
        style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}
      >
        <Defs>
          <SvgLinearGradient id="day-ring" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={palette.aguamarina} />
            <Stop offset="1" stopColor={palette.morado} />
          </SvgLinearGradient>
        </Defs>
        <Circle cx={20} cy={20} r={RING_RADIUS} fill="none" stroke={palette.anilloTrack} strokeWidth={5} />
        <Circle
          cx={20}
          cy={20}
          r={RING_RADIUS}
          fill="none"
          stroke="url(#day-ring)"
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={RING_CIRCUMFERENCE * (1 - kind.pct / 100)}
        />
      </Svg>
      <Text className="text-[13px] font-semibold text-teal-profundo">{kind.day}</Text>
    </View>
  );
}
