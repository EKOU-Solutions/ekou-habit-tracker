import type { Habit } from '@/store/useHabitStore';
import { palette, withAlpha } from '@/theme/palette';

export interface StarterHabit extends Omit<Habit, 'isPriority'> {
  /** Color de fondo del ícono en la card del kit. */
  accent: string;
}

/**
 * Datos iniciales del kit de Día Cero (Home 1.2a). Edita esta lista para cambiar
 * los hábitos sugeridos al empezar: cada entrada necesita id único, nombre, emoji,
 * etiqueta de horario y accent; `timerLabel` es opcional (muestra el chip ▶).
 */
export const STARTER_HABITS: StarterHabit[] = [
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

/** Ids que aparecen preseleccionados al abrir el Día Cero. */
export const STARTER_PRESELECTED = ['agua'];
