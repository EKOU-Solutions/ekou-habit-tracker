import type { IconProvider } from './types';

/**
 * IA de iconos on-device para Android (aún no habilitado en el producto). Cuando se active
 * Android —donde no hay Apple Intelligence— se implementa `propose` aquí, p. ej. con
 * Gemini Nano vía ML Kit GenAI, o un runtime cross-platform (MLC / ExecuTorch / llama.rn).
 * Hoy reporta no disponible: el orquestador lo salta y cae al matcher local en español,
 * que ya funciona en Android sin cambios. Sumar el proveedor real no toca al resto del flujo.
 */
export const androidProvider: IconProvider = {
  id: 'android-on-device',
  async isAvailable() {
    return false;
  },
  async propose() {
    return [];
  },
};
