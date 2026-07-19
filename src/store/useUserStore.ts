import { create } from 'zustand';

interface UserState {
  nickname: string;
  hasOnboarded: boolean;
  completeOnboarding: (nickname: string) => void;
}

// Estado en memoria; MMKV se añade cuando el proyecto tenga development build (no funciona en Expo Go).
export const useUserStore = create<UserState>()((set) => ({
  nickname: '',
  hasOnboarded: false,
  completeOnboarding: (nickname) =>
    set({ nickname: nickname.trim(), hasOnboarded: true }),
}));
