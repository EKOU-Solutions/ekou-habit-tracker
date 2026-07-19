import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GradientText } from '@/components/GradientText';
import { EchoOrb } from '@/screens/onboarding/EchoOrb';
import { useUserStore } from '@/store/useUserStore';
import { gradientInmersivo, palette, withAlpha } from '@/theme/palette';

// Onboarding 1.1: una sola pantalla (apodo + "Empezar mi racha"); sin cuentas, alimenta el saludo de la Home.
export function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);
  const [nickname, setNickname] = useState('');

  const canStart = nickname.trim().length > 0;

  const handleStart = () => {
    if (!canStart) return;
    completeOnboarding(nickname);
    router.replace('/home');
  };

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <LinearGradient
        colors={gradientInmersivo.colors}
        locations={gradientInmersivo.locations}
        start={{ x: 0.37, y: 0 }}
        end={{ x: 0.63, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <View
          className="flex-1 px-[30px]"
          style={{ paddingTop: insets.top + 60 }}
        >
          <EchoOrb />

          <Text className="mt-[18px] text-[34px] font-extrabold tracking-[-0.5px] text-white">
            Hola, soy EKOU.
          </Text>
          <Text className="mt-[10px] text-base leading-[25px] text-white/[0.78]">
            Guardo tus hábitos y cuido tu racha. Un hábito al día basta para que
            el eco no se apague.
          </Text>

          <View className="mt-[34px]">
            <Text className="mb-2 text-[13px] font-semibold tracking-[0.3px] text-white/[0.65]">
              ¿CÓMO QUIERES QUE TE LLAME?
            </Text>
            <View className="h-[56px] flex-row items-center rounded-[18px] border border-white/[0.35] bg-white/[0.13] px-[18px]">
              <TextInput
                value={nickname}
                onChangeText={setNickname}
                placeholder="Tu apodo"
                placeholderTextColor={withAlpha(palette.blanco, 0.45)}
                selectionColor={palette.aguamarina}
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleStart}
                className="min-w-0 flex-1 self-stretch py-0 text-[18px] font-semibold text-white"
              />
            </View>
            <Text className="mt-2 text-xs text-white/50">
              Vale un apodo o un alias: HOLDER302, Oli…
            </Text>
          </View>

          <View className="flex-1" />

          <View
            className="items-center gap-y-3.5"
            style={{ paddingBottom: Math.max(insets.bottom, 24) + 32 }}
          >
            <Pressable
              onPress={handleStart}
              disabled={!canStart}
              accessibilityRole="button"
              accessibilityLabel="Empezar mi racha"
              className="h-[58px] w-full flex-row items-center justify-center gap-x-2 rounded-full bg-white active:opacity-90"
              style={[styles.ctaShadow, !canStart && styles.ctaDisabled]}
            >
              <GradientText className="text-[17px] font-extrabold">
                Empezar mi racha
              </GradientText>
              <Text className="text-base" style={{ color: palette.morado }}>
                →
              </Text>
            </Pressable>
            <Text className="text-xs text-white/[0.55]">
              Sin cuentas ni correos. Todo vive en tu iPhone.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  ctaShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  ctaDisabled: {
    opacity: 0.6,
  },
});
