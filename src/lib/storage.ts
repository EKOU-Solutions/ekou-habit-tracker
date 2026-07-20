import { Platform } from 'react-native';
import type { StateStorage } from 'zustand/middleware';

// MMKV v3 no tiene implementación web: en web (harness de verificación) se usa localStorage,
// con optional chaining porque el prerender estático de Expo corre en Node sin localStorage.
export const storage: StateStorage =
  Platform.OS === 'web'
    ? {
        getItem: (name) => globalThis.localStorage?.getItem(name) ?? null,
        setItem: (name, value) => globalThis.localStorage?.setItem(name, value),
        removeItem: (name) => globalThis.localStorage?.removeItem(name),
      }
    : createNativeStorage();

function createNativeStorage(): StateStorage {
  // require dentro de la rama nativa: el import estático ejecutaría el TurboModule en web.
  const { MMKV } = require('react-native-mmkv') as typeof import('react-native-mmkv');
  const mmkv = new MMKV({ id: 'ekou' });
  return {
    getItem: (name) => mmkv.getString(name) ?? null,
    setItem: (name, value) => mmkv.set(name, value),
    removeItem: (name) => mmkv.delete(name),
  };
}
