import { create } from 'zustand';

interface UserState {
  /** Apodo/alias elegido en el onboarding; alimenta el saludo de la Home. */
  nickname: string;
  hasOnboarded: boolean;
  completeOnboarding: (nickname: string) => void;
}

/**
 * Estado del usuario en memoria. La persistencia local (react-native-mmkv)
 * se añadirá cuando el proyecto pase a development build, ya que MMKV no
 * funciona en Expo Go.
 */
export const useUserStore = create<UserState>()((set) => ({
  nickname: '',
  hasOnboarded: false,
  completeOnboarding: (nickname) =>
    set({ nickname: nickname.trim(), hasOnboarded: true }),
}));
