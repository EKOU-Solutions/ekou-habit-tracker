import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { useCallback, useRef, useState } from 'react';

export type CaptureState = 'idle' | 'listening' | 'error';

/**
 * Captura de voz on-device (expo-speech-recognition → iOS Speech / Android SpeechRecognizer).
 * Pide permisos, transcribe en vivo (resultados parciales) y, si el reconocimiento offline no
 * está disponible para el idioma, reintenta una vez sin exigirlo antes de reportar error.
 */
export function useVoiceCapture(lang = 'es-ES') {
  const [transcript, setTranscript] = useState('');
  const [state, setState] = useState<CaptureState>('idle');
  const [error, setError] = useState<string | null>(null);
  const onDeviceRef = useRef(true);

  const startInternal = useCallback(
    (onDevice: boolean) => {
      ExpoSpeechRecognitionModule.start({
        lang,
        interimResults: true,
        continuous: true,
        requiresOnDeviceRecognition: onDevice,
      });
    },
    [lang],
  );

  useSpeechRecognitionEvent('start', () => setState('listening'));
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
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch {
      // stop en un estado ya detenido no es un error para el usuario.
    }
  }, []);

  return { transcript, state, error, start, stop, setTranscript };
}
