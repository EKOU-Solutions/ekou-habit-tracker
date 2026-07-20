import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { AvatarBadge } from '@/components/AvatarBadge';
import { MicIcon } from '@/components/icons';
import { useHabitStore, type Habit } from '@/store/useHabitStore';
import { useUserStore } from '@/store/useUserStore';
import { gradientPrincipal, palette, withAlpha } from '@/theme/palette';
import { cardShadow, primaryCtaShadow, softBadgeShadow } from '@/theme/shadows';

interface StarterHabit extends Omit<Habit, 'doneToday' | 'isPriority'> {
  accent: string;
}

const STARTER_HABITS: StarterHabit[] = [
  {
    id: 'agua',
    name: 'Tomar agua',
    icon: '💧',
    scheduleLabel: 'Todos los días',
    accent: withAlpha(palette.aguamarina, 0.16),
  },
  {
    id: 'meditar',
    name: 'Meditar',
    icon: '🧘',
    scheduleLabel: '10 min · mañana',
    accent: withAlpha(palette.morado, 0.1),
  },
  {
    id: 'leer',
    name: 'Leer',
    icon: '📖',
    scheduleLabel: '20 min · noche',
    accent: withAlpha(palette.marino, 0.08),
    timerLabel: '20:00',
  },
];

/** Home 1.2a — día cero: kit de inicio con hábitos sugeridos, sin racha todavía. */
export function DiaCeroKit() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const nickname = useUserStore((s) => s.nickname);
  const addHabit = useHabitStore((s) => s.addHabit);
  const [selectedIds, setSelectedIds] = useState<string[]>(['agua']);

  const toggleSelected = (id: string) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  const handleStart = () => {
    STARTER_HABITS.filter((h) => selectedIds.includes(h.id)).forEach(({ accent: _, ...habit }) =>
      addHabit({ ...habit, isPriority: false }),
    );
  };

  return (
    <View className="flex-1 bg-fondo">
      <ScrollView
        contentContainerStyle={{
          paddingTop: Math.max(82, insets.top + 23),
          paddingHorizontal: 20,
          paddingBottom: 180,
        }}
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-[26px] font-extrabold leading-[30px] tracking-[-0.5px] text-marino">
              Empecemos,{'\n'}
              {nickname || 'ahí'}
            </Text>
            <Text className="mt-1.5 text-sm text-gris-600">
              Elige uno para encender tu racha. Con uno al día basta.
            </Text>
          </View>
          <AvatarBadge nickname={nickname} />
        </View>

        <View className="mb-3 mt-[18px] flex-row items-center gap-2 px-1">
          <Text className="text-[11px] font-bold tracking-[0.09em] text-gris-500">
            HÁBITOS LISTOS PARA EMPEZAR
          </Text>
          <View className="h-px flex-1 bg-marino/[0.08]" />
        </View>

        <View className="flex-row flex-wrap justify-between gap-y-3">
          {STARTER_HABITS.map((habit) => (
            <StarterCard
              key={habit.id}
              habit={habit}
              selected={selectedIds.includes(habit.id)}
              onPress={() => toggleSelected(habit.id)}
            />
          ))}
          {/* El gradiente va como fondo absoluto: un h-full dentro de una fila wrap de altura
              automática crea una dependencia circular en Yoga y estiraba toda la fila. */}
          <Pressable
            onPress={() => router.push('/crear/texto')}
            accessibilityRole="button"
            className="w-[48.5%] items-center justify-center gap-1.5 overflow-hidden rounded-[22px] border-[1.5px] border-dashed border-marino/[0.18] p-4"
          >
            <LinearGradient
              colors={[withAlpha(palette.marino, 0.05), withAlpha(palette.morado, 0.07)]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.87, y: 0.5 }}
              className="absolute inset-0"
            />
            <View
              className="h-11 w-11 items-center justify-center rounded-full bg-white"
              style={softBadgeShadow}
            >
              <Svg width={18} height={18} viewBox="0 0 20 20">
                <Path d="M10 3v14M3 10h14" stroke={palette.marino} strokeWidth={2.2} strokeLinecap="round" />
              </Svg>
            </View>
            <Text className="text-center text-[13.5px] font-bold text-marino">Crear el mío</Text>
          </Pressable>
        </View>
      </ScrollView>

      <LinearGradient
        colors={[withAlpha(palette.fondo, 0), palette.fondo]}
        locations={[0, 0.28]}
        className="absolute bottom-0 left-0 right-0 gap-2.5 px-5 pt-3.5"
        style={{ paddingBottom: Math.max(34, insets.bottom + 12) }}
      >
        <Pressable
          onPress={handleStart}
          disabled={selectedIds.length === 0}
          accessibilityRole="button"
          accessibilityLabel="Empezar mi racha"
        >
          <LinearGradient
            colors={gradientPrincipal}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="h-14 flex-row items-center justify-center gap-[9px] rounded-full"
            style={[primaryCtaShadow, selectedIds.length === 0 && { opacity: 0.5 }]}
          >
            <Text className="text-base font-bold text-white">Empezar mi racha</Text>
            <Text className="text-[15px] text-white">→</Text>
          </LinearGradient>
        </Pressable>
        <Pressable
          onPress={() => router.push('/crear/voz')}
          accessibilityRole="button"
          className="flex-row items-center justify-center gap-[7px]"
        >
          <MicIcon color={palette.tealProfundo} size={16} />
          <Text className="text-center text-[13px] font-bold text-teal-profundo">
            O díctale un hábito a EKOU
          </Text>
        </Pressable>
      </LinearGradient>
    </View>
  );
}

function StarterCard({
  habit,
  selected,
  onPress,
}: {
  habit: StarterHabit;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={habit.name}
      className="w-[48.5%] rounded-[22px] bg-white p-4"
      style={[
        cardShadow,
        selected && { outlineWidth: 1.5, outlineColor: withAlpha(palette.aguamarina, 0.5) },
      ]}
    >
      <View
        className="h-12 w-12 items-center justify-center rounded-2xl"
        style={{ backgroundColor: habit.accent }}
      >
        <Text className="text-[25px]">{habit.icon}</Text>
      </View>
      <Text className="mt-3 text-base font-bold text-tinta">{habit.name}</Text>
      <Text className="mt-0.5 text-xs text-gris-500">{habit.scheduleLabel}</Text>
      <View
        className={`absolute right-3.5 top-3.5 h-7 w-7 items-center justify-center rounded-full ${
          selected ? 'bg-aguamarina' : 'border-2 border-gris-200'
        }`}
      >
        {selected ? (
          <Svg width={12} height={10} viewBox="0 0 14 12">
            <Path
              d="M1 6.5L5 10.5L13 1.5"
              stroke={palette.blanco}
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        ) : (
          <Svg width={12} height={12} viewBox="0 0 12 12">
            <Path d="M6 2v8M2 6h8" stroke={palette.gris400} strokeWidth={2} strokeLinecap="round" />
          </Svg>
        )}
      </View>
    </Pressable>
  );
}
