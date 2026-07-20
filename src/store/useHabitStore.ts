import { useMemo } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { todayKey } from '@/lib/dates';
import { storage } from '@/lib/storage';
import { bestStreak, currentStreak, type HabitHistory } from '@/lib/streak';

export interface Habit {
  id: string;
  name: string;
  icon: string;
  scheduleLabel: string;
  isPriority: boolean;
  timerLabel?: string;
}

/** Hábito decorado con su estado del día para la UI; el hecho/no hecho vive en `history`. */
export interface HabitStatus extends Habit {
  doneToday: boolean;
}

interface HabitState {
  habits: Habit[];
  /** Ids de hábitos completados por día local (YYYY-MM-DD). Fuente única del progreso y la racha. */
  history: HabitHistory;
  addHabit: (habit: Habit) => void;
  toggleDone: (habitId: string, dateKey?: string) => void;
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set) => ({
      habits: [],
      history: {},
      addHabit: (habit) =>
        set((state) => {
          // Dedup por id: el kit de día cero usa ids fijos (idempotente al reseleccionar);
          // los flujos de crear generan ids únicos, así que siempre añaden.
          if (state.habits.some((h) => h.id === habit.id)) return state;
          return { habits: [...state.habits, habit] };
        }),
      toggleDone: (habitId, dateKey = todayKey()) =>
        set((state) => {
          const done = state.history[dateKey] ?? [];
          const next = done.includes(habitId)
            ? done.filter((id) => id !== habitId)
            : [...done, habitId];
          return { history: { ...state.history, [dateKey]: next } };
        }),
    }),
    { name: 'ekou-habits', storage: createJSONStorage(() => storage) },
  ),
);

const EMPTY_DAY: string[] = [];

/** Ids completados de un día; referencia estable cuando el día no tiene registros. */
export function useDoneIds(dateKey: string): string[] {
  return useHabitStore((s) => s.history[dateKey]) ?? EMPTY_DAY;
}

export function useStreak(): number {
  const history = useHabitStore((s) => s.history);
  return useMemo(() => currentStreak(history), [history]);
}

export function useBestStreak(): number {
  const history = useHabitStore((s) => s.history);
  return useMemo(() => bestStreak(history), [history]);
}
