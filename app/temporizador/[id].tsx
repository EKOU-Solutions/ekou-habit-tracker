import { Stack } from 'expo-router';

import { TemporizadorScreen } from '@/screens/timer/TemporizadorScreen';

export default function TemporizadorRoute() {
  return (
    <>
      {/* Entra desde abajo: es una sesión enfocada sobre la Home, no un destino de navegación. */}
      <Stack.Screen options={{ animation: 'slide_from_bottom' }} />
      <TemporizadorScreen />
    </>
  );
}
