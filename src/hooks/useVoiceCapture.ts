import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { useCallback, useRef, useState } from 'react';
import { useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';

export type CaptureState = 'idle' | 'listening' | 'error';

/**
 * Captura de voz on-device (expo-speech-recognition → iOS Speech / Android SpeechRecognizer).
 * Pide permisos, transcribe en vivo (resultados parciales) y, si el reconocimiento offline no
 * está disponible para el idioma, reintenta una vez sin exigirlo antes de reportar error.
 */
export interface VoiceCapture {
  transcript: string;
  state: CaptureState;
  error: string | null;
  /** Volumen de entrada normalizado 0..1, para animaciones reactivas a la voz. */
  volume: SharedValue<number>;
  start: () => Promise<boolean>;
  stop: () => void;
  setTranscript: (text: string) => void;
}

export function useVoiceCapture(lang = 'es-ES'): VoiceCapture {
  const [transcript, setTranscript] = useState('');
  const [state, setState] = useState<CaptureState>('idle');
  const [error, setError] = useState<string | null>(null);
  const onDeviceRef = useRef(true);
  const volume = useSharedValue(0);

  const startInternal = useCallback(
    (onDevice: boolean) => {
      ExpoSpeechRecognitionModule.start({
        lang,
        interimResults: true,
        continuous: true,
        requiresOnDeviceRecognition: onDevice,
        volumeChangeEventOptions: { enabled: true, intervalMillis: 100 },
      });
    },
    [lang],
  );

  useSpeechRecognitionEvent('start', () => setState('listening'));
  useSpeechRecognitionEvent('volumechange', (event) => {
    // En web el evento no trae payload (la API no reporta volumen): se ignora sin romper.
    const raw = event?.value;
    if (typeof raw !== 'number') return;
    // value va de -2 a 10 (bajo 0 = inaudible); se mapea a 0..1 para las barras.
    volume.value = withTiming(Math.max(0, Math.min(1, raw / 8)), { duration: 90 });
  });
  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results?.[0]?.transcript ?? '';
    if (text) setTranscript(text);
  });
  useSpeechRecognitionEvent('error', (event) => {
    if (
      onDeviceRef.current &&
      (event.error === 'language-not-supported' || event.error === 'service-not-allowed')
    ) {
      onDeviceRef.current = false;
      startInternal(false);
      return;
    }
    setError(event.message || event.error);
    setState('error');
  });
  useSpeechRecognitionEvent('end', () => setState((s) => (s === 'error' ? s : 'idle')));

  const start = useCallback(async () => {
    setError(null);
    setTranscript('');
    try {
      const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!perm.granted) {
        setError('Necesito permiso de micrófono y reconocimiento de voz.');
        setState('error');
        return false;
      }
      onDeviceRef.current = true;
      startInternal(true);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pude iniciar el dictado.');
      setState('error');
      return false;
    }
  }, [startInternal]);

  const stop = useCallback(() => {
    volume.value = withTiming(0, { duration: 200 });
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch {
      // stop en un estado ya detenido no es un error para el usuario.
    }
  }, [volume]);

  return { transcript, state, error, volume, start, stop, setTranscript };
}
