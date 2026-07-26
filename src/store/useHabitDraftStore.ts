import { create } from 'zustand';

import type { VoiceHabit } from '@/lib/voice';

interface DraftState {
  /** Hábito dictado pendiente de confirmar; lo lee la pantalla de edición en modo "nuevo". */
  draft: VoiceHabit | null;
  setDraft: (draft: VoiceHabit | null) => void;
}

// En memoria a propósito: es un traspaso efímero entre la preview de voz y la edición.
export const useHabitDraftStore = create<DraftState>((set) => ({
  draft: null,
  setDraft: (draft) => set({ draft }),
}));
