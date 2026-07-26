import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { ConfirmDeleteHabit } from '@/components/ConfirmDeleteHabit';
import { DayCircle, MomentoCard, Toggle } from '@/components/ScheduleControls';
import { DAY_LETTERS } from '@/lib/dates';
import {
  buildScheduleLabel,
  FRECUENCIA_SEGMENTS,
  MOMENTOS,
  type Frecuencia,
  type Momento,
} from '@/lib/habitSchedule';
import { IconIASheet } from '@/screens/crear/IconIASheet';
import { useHabitDraftStore } from '@/store/useHabitDraftStore';
import { useHabitStore } from '@/store/useHabitStore';
import { gradientIA, gradientPrincipal, palette } from '@/theme/palette';
import { crearCtaShadow, iconTileShadow, panelShadow, softBadgeShadow } from '@/theme/shadows';

/** Datos precargados desde el dictado por voz cuando aún no existe el hábito (id="nuevo"). */
interface Draft {
  name: string;
  icon?: string;
  frequency?: Frecuencia;
  days?: string[];
  moment?: Momento | null;
  reminder?: boolean;
  timerLabel?: string;
}

/** Editar hábito (4b): una sola pantalla con scroll; cambia ícono (IA), nombre, frecuencia, momento y recordatorio. */
export function EditarHabitoScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id, draft } = useLocalSearchParams<{ id: string; draft?: string }>();
  const storedHabit = useHabitStore((s) => s.habits.find((h) => h.id === id));
  const addHabit = useHabitStore((s) => s.addHabit);
  const updateHabit = useHabitStore((s) => s.updateHabit);
  const removeHabit = useHabitStore((s) => s.removeHabit);

  // Modo "nuevo": llegamos desde la preview de voz con un borrador; el hábito se crea al guardar.
  // Preferimos el store en memoria (navegación normal); el param `draft` queda como respaldo
  // por si se abre la ruta en frío (deep-link).
  const draftFromStore = useHabitDraftStore((s) => s.draft);
  const draftHabit = useMemo<Draft | null>(() => {
    if (id === 'nuevo' && draftFromStore) return draftFromStore;
    if (!draft) return null;
    try {
      return JSON.parse(draft) as Draft;
    } catch {
      return null;
    }
  }, [draft, draftFromStore, id]);
  const isNew = draftHabit !== null;
  const source = storedHabit ?? draftHabit;
  const timerLabel = source?.timerLabel;

  const [name, setName] = useState(source?.name ?? '');
  const [icon, setIcon] = useState(source?.icon ?? '🧘');
  const [frecuencia, setFrecuencia] = useState<Frecuencia>(source?.frequency ?? 'diario');
  const [selectedDays, setSelectedDays] = useState<string[]>(source?.days ?? []);
  const [momento, setMomento] = useState<Momento | null>(source?.moment ?? null);
  const [reminder, setReminder] = useState(source?.reminder ?? true);
  const [showIASheet, setShowIASheet] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const reminderTime = useMemo(
    () => (momento ? MOMENTOS.find((m) => m.id === momento)!.reminder.slice(0, 5) : '07:00'),
    [momento],
  );

  // Sin hábito guardado ni borrador no hay nada que editar (p. ej. tras borrarlo).
  if (!source) return <View className="flex-1 bg-fondo" />;

  const canSave = name.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    const fields = {
      name: name.trim(),
      icon,
      frequency: frecuencia,
      days: frecuencia === 'dias' ? selectedDays : [],
      moment: momento ?? undefined,
      reminder,
      timerLabel,
      scheduleLabel: buildScheduleLabel(frecuencia, selectedDays, momento),
    };
    if (isNew) {
      addHabit({ id: `habito-${Date.now()}`, isPriority: false, ...fields });
    } else {
      updateHabit(id, fields);
    }
    router.back();
  };

  const remove = () => {
    removeHabit(id);
    router.back();
  };

  return (
    <View className="flex-1 bg-fondo">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <View className="flex-row items-center justify-between px-5" style={{ paddingTop: Math.max(64, insets.top + 12) }}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            hitSlop={8}
            className="h-9 w-9 items-center justify-center rounded-full bg-white"
            style={softBadgeShadow}
          >
            <Svg width={8} height={14} viewBox="0 0 8 14">
              <Path d="M7 1L1 7l6 6" stroke={palette.marino} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <Text className="text-[17px] font-extrabold text-marino">Editar hábito</Text>
          <Pressable onPress={save} disabled={!canSave} accessibilityRole="button" accessibilityLabel="Guardar" hitSlop={8}>
            <Text className={`text-[15px] font-bold ${canSave ? 'text-marino' : 'text-gris-300'}`}>Guardar</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: Math.max(40, insets.bottom + 20) }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center">
            <Pressable
              onPress={() => setShowIASheet(true)}
              accessibilityRole="button"
              accessibilityLabel="Cambiar el ícono"
              className="relative h-[88px] w-[88px] items-center justify-center rounded-[26px] bg-white"
              style={iconTileShadow}
            >
              <Text className="text-[44px]">{icon}</Text>
              <LinearGradient
                colors={gradientIA}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="absolute -right-2 -top-2 h-[30px] w-[30px] items-center justify-center rounded-full"
              >
                <Text className="text-sm">✨</Text>
              </LinearGradient>
            </Pressable>
            <Text className="mt-2.5 text-[12.5px] font-bold text-morado">Toca para cambiar el ícono</Text>
          </View>

          <FieldLabel>NOMBRE</FieldLabel>
          <View className="rounded-[18px] bg-white px-4 py-3.5" style={panelShadow}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Nombre del hábito"
              placeholderTextColor={palette.gris300}
              selectionColor={palette.morado}
              autoCorrect={false}
              className="p-0 text-base font-semibold text-tinta"
            />
          </View>

          <FieldLabel>FRECUENCIA</FieldLabel>
          <View className="flex-row gap-2">
            {FRECUENCIA_SEGMENTS.map((seg) => (
              <FrecuenciaSegment
                key={seg.id}
                label={seg.label}
                selected={frecuencia === seg.id}
                onPress={() => setFrecuencia(seg.id)}
              />
            ))}
          </View>
          {frecuencia === 'dias' ? (
            <View className="mt-2.5 flex-row justify-between gap-1.5 rounded-[22px] bg-white px-3.5 py-3.5" style={panelShadow}>
              {DAY_LETTERS.map((d) => (
                <DayCircle
                  key={d}
                  letter={d}
                  selected={selectedDays.includes(d)}
                  onPress={() =>
                    setSelectedDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))
                  }
                />
              ))}
            </View>
          ) : null}

          <FieldLabel>MOMENTO DEL DÍA</FieldLabel>
          <View className="flex-row gap-2.5">
            {MOMENTOS.map((m) => (
              <MomentoCard
                key={m.id}
                momento={m}
                selected={momento === m.id}
                onPress={() => setMomento(momento === m.id ? null : m.id)}
              />
            ))}
          </View>

          <View className="mt-5 flex-row items-center gap-3 rounded-[18px] bg-white px-3.5 py-[13px]" style={panelShadow}>
            <View className="h-10 w-10 items-center justify-center rounded-[13px] bg-gris-100">
              <Text className="text-lg">🔔</Text>
            </View>
            <View className="flex-1">
              <Text className="text-[14.5px] font-bold text-tinta">Recordatorio</Text>
              <Text className="mt-px text-xs text-gris-500">Alerta puntual</Text>
            </View>
            {reminder ? (
              <View className="rounded-[10px] bg-gris-100 px-2.5 py-1">
                <Text className="text-base font-extrabold text-marino">{reminderTime}</Text>
              </View>
            ) : null}
            <Toggle value={reminder} onToggle={() => setReminder(!reminder)} />
          </View>

          <Pressable onPress={save} disabled={!canSave} accessibilityRole="button" className="mt-6">
            <LinearGradient
              colors={gradientPrincipal}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="h-14 items-center justify-center rounded-full"
              style={[crearCtaShadow, !canSave && { opacity: 0.5 }]}
            >
              <Text className="text-[16px] font-bold text-white">Guardar cambios</Text>
            </LinearGradient>
          </Pressable>
          {isNew ? null : (
            <Pressable
              onPress={() => setConfirmDelete(true)}
              accessibilityRole="button"
              className="mt-3.5 items-center py-2"
            >
              <Text className="text-sm font-bold text-morado">Eliminar hábito</Text>
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {showIASheet ? (
        <IconIASheet
          habitName={name.trim() || source.name}
          onPick={(picked) => {
            setIcon(picked);
            setShowIASheet(false);
          }}
          onClose={() => setShowIASheet(false)}
        />
      ) : null}

      {confirmDelete ? (
        <ConfirmDeleteHabit habitName={source.name} onConfirm={remove} onCancel={() => setConfirmDelete(false)} />
      ) : null}
    </View>
  );
}

function FieldLabel({ children }: { children: string }) {
  return <Text className="mb-2 ml-1 mt-5 text-[11px] font-bold tracking-[0.06em] text-gris-500">{children}</Text>;
}

function FrecuenciaSegment({
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
      <Pressable onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected }} className="flex-1">
        <LinearGradient
          colors={gradientPrincipal}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="h-11 items-center justify-center rounded-[22px]"
        >
          <Text className="text-[13.5px] font-bold text-white">{label}</Text>
        </LinearGradient>
      </Pressable>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      className="h-11 flex-1 items-center justify-center rounded-[22px] bg-white"
      style={panelShadow}
    >
      <Text className="text-[13.5px] font-semibold text-gris-600">{label}</Text>
    </Pressable>
  );
}
