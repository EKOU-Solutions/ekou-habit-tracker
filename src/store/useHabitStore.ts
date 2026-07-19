import { create } from 'zustand';

export interface Habit {
  id: string;
  name: string;
  icon: string;
  scheduleLabel: string;
  isPriority: boolean;
  timerLabel?: string;
  doneToday: boolean;
}

interface HabitState {
  habits: Habit[];
  // TODO(persistencia): calcular desde el historial real cuando llegue MMKV; valor de ejemplo del diseño.
  streakDays: number;
  toggleHabit: (id: string) => void;
  addHabit: (habit: Omit<Habit, 'doneToday'>) => void;
}

// Estado en memoria; MMKV se añade cuando el proyecto tenga development build (no funciona en Expo Go).
export const useHabitStore = create<HabitState>()((set) => ({
  habits: [],
  streakDays: 12,
  toggleHabit: (id) =>
    set((state) => ({
      habits: state.habits.map((h) =>
        h.id === id ? { ...h, doneToday: !h.doneToday } : h,
      ),
    })),
  addHabit: (habit) =>
    set((state) => {
      const exists = state.habits.some(
        (h) => h.id === habit.id || h.name.toLowerCase() === habit.name.toLowerCase(),
      );
      if (exists) return state;
      return { habits: [...state.habits, { ...habit, doneToday: false }] };
    }),
}));
