import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { storage } from '@/lib/storage';

interface UserState {
  nickname: string;
  hasOnboarded: boolean;
  completeOnboarding: (nickname: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      nickname: '',
      hasOnboarded: false,
      completeOnboarding: (nickname) => set({ nickname: nickname.trim(), hasOnboarded: true }),
    }),
    { name: 'ekou-user', storage: createJSONStorage(() => storage) },
  ),
);
