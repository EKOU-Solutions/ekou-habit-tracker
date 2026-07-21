import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { BottomSheet } from '@/components/BottomSheet';
import { proposeIcons } from '@/lib/icons';
import { gradientPrincipal, palette, withAlpha } from '@/theme/palette';
import { primaryCtaShadow } from '@/theme/shadows';

const SLOT_COUNT = 4;

interface IconIASheetProps {
  habitName: string;
  onPick: (icon: string) => void;
  onClose: () => void;
}

/** Sheet 2.1e — Ícono con IA: propuestas on-device, "generar 4 más", descripción propia y CTA de uso. */
export function IconIASheet({ habitName, onPick, onClose }: IconIASheetProps) {
  const [icons, setIcons] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [describe, setDescribe] = useState('');
  const queryRef = useRef(habitName);
  const seenRef = useRef<string[]>([]);
  const aliveRef = useRef(true);

  useEffect(() => {
    return () => {
      aliveRef.current = false;
    };
  }, []);

  const generate = useCallback(async (query: string, fresh: boolean) => {
    queryRef.current = query;
    if (fresh) seenRef.current = [];
    setLoading(true);
    const next = await proposeIcons({ query, exclude: seenRef.current, count: SLOT_COUNT });
    if (!aliveRef.current) return;
    seenRef.current = [...seenRef.current, ...next];
    setIcons(next);
    setSelected(next[0] ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    generate(habitName, true);
  }, [generate, habitName]);

  const handleDescribe = () => {
    if (describe.trim().length === 0 || loading) return;
    generate(describe.trim(), true);
  };

  return (
    <BottomSheet onClose={onClose} entrance="pop">
      <View className="px-[22px] pb-[46px] pt-2.5">
        <View className="mx-auto mb-4 h-[5px] w-[38px] rounded-[3px] bg-pista" />
        <View className="flex-row items-center gap-2">
          <Text className="text-[19px]">✨</Text>
          <Text className="text-[21px] font-extrabold tracking-[-0.3px] text-tinta">Ícono con IA</Text>
        </View>
        <Text className="mt-[5px] text-[13.5px] text-gris-500">
          Propuestas para <Text className="font-bold text-tinta">«{queryRef.current}»</Text>
        </Text>

        <View className="mt-[18px] flex-row flex-wrap justify-between gap-y-3">
          {loading
            ? Array.from({ length: SLOT_COUNT }, (_, i) => <GeneratingCell key={i} />)
            : icons.map((icon) => (
                <IconCell
                  key={icon}
                  icon={icon}
                  selected={icon === selected}
                  onPress={() => setSelected(icon)}
                />
              ))}
        </View>

        <View className="mt-4 flex-row items-center gap-2.5 rounded-[22px] bg-gris-100 px-4 py-3">
          <TextInput
            value={describe}
            onChangeText={setDescribe}
            placeholder="Descríbelo tú · «flor de loto»…"
            placeholderTextColor={palette.gris500}
            returnKeyType="send"
            onSubmitEditing={handleDescribe}
            className="flex-1 p-0 text-sm text-tinta"
          />
          <Pressable
            onPress={handleDescribe}
            accessibilityRole="button"
            accessibilityLabel="Generar con tu descripción"
            hitSlop={8}
          >
            <Text className="text-[15px]">✨</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => selected && onPick(selected)}
          disabled={!selected}
          accessibilityRole="button"
        >
          <LinearGradient
            colors={gradientPrincipal}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="mt-4 h-[54px] items-center justify-center rounded-full"
            style={[primaryCtaShadow, !selected && { opacity: 0.5 }]}
          >
            <Text className="text-[16.5px] font-bold text-white">Usar este ícono</Text>
          </LinearGradient>
        </Pressable>
        <Pressable
          onPress={() => !loading && generate(queryRef.current, false)}
          accessibilityRole="button"
          accessibilityLabel="Generar 4 más"
        >
          <Text className="mt-3.5 text-center text-[13px] font-bold text-morado">Generar 4 más</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

function IconCell({
  icon,
  selected,
  onPress,
}: {
  icon: string;
  selected: boolean;
  onPress: () => void;
}) {
  const cell = (
    <>
      <Text className="text-[56px]">{icon}</Text>
      {selected ? (
        <LinearGradient
          colors={gradientPrincipal}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="absolute right-2.5 top-2.5 h-[26px] w-[26px] items-center justify-center rounded-full"
        >
          <Svg width={12} height={10} viewBox="0 0 12 10">
            <Path
              d="M1 5l3.5 3.5L11 1"
              stroke={palette.blanco}
              strokeWidth={2.2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </LinearGradient>
      ) : null}
    </>
  );

  if (selected) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="radio"
        accessibilityState={{ selected }}
        className="aspect-square w-[48%]"
      >
        <LinearGradient
          colors={[withAlpha(palette.aguamarina, 0.14), withAlpha(palette.morado, 0.1)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="h-full w-full items-center justify-center rounded-[22px]"
          style={{ borderWidth: 2.5, borderColor: palette.morado }}
        >
          {cell}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      className="aspect-square w-[48%] items-center justify-center rounded-[22px]"
      style={{ backgroundColor: palette.gris50 }}
    >
      {cell}
    </Pressable>
  );
}

function GeneratingCell() {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.linear }), -1);
  }, [shimmer]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shimmer.value, [0, 1], [-160, 160]) }],
  }));

  return (
    <View className="aspect-square w-[48%] items-center justify-center gap-2 overflow-hidden rounded-[22px] bg-gris-150">
      <Animated.View
        style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, animatedStyle]}
      >
        <LinearGradient
          colors={[withAlpha(palette.blanco, 0), withAlpha(palette.blanco, 0.55), withAlpha(palette.blanco, 0)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="h-full w-full"
        />
      </Animated.View>
      <Text className="text-[22px] opacity-55">✨</Text>
      <Text className="text-[11.5px] font-bold tracking-[0.06em] text-gris-500">GENERANDO…</Text>
    </View>
  );
}
