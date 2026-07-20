import { Redirect } from 'expo-router';

import { OnboardingScreen } from '@/screens/onboarding/OnboardingScreen';
import { useUserStore } from '@/store/useUserStore';

// El onboarding corre una sola vez: MMKV hidrata síncrono, así que al relanzar
// el app entra directo a Home sin parpadeo.
export default function Index() {
  const hasOnboarded = useUserStore((s) => s.hasOnboarded);
  if (hasOnboarded) return <Redirect href="/home" />;
  return <OnboardingScreen />;
}
