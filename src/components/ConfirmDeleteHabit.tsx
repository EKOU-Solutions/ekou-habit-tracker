import { useEffect } from 'react';
import { BackHandler, Pressable, Text, View } from 'react-native';

import { PopIn } from '@/components/PopIn';
import { palette, withAlpha } from '@/theme/palette';
import { panelShadow } from '@/theme/shadows';

interface ConfirmDeleteHabitProps {
  habitName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmación de borrado (4c): diálogo centrado "en el sitio", no navega. Overlay absoluto
 * dentro del árbol de la pantalla, igual criterio que BottomSheet (un Modal pierde NativeWind).
 */
export function ConfirmDeleteHabit({ habitName, onConfirm, onCancel }: ConfirmDeleteHabitProps) {
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onCancel();
      return true;
    });
    return () => sub.remove();
  }, [onCancel]);

  return (
    <View className="absolute inset-0 z-50 items-center justify-center px-8">
      <Pressable
        onPress={onCancel}
        accessibilityLabel="Cancelar"
        className="absolute inset-0"
        style={{ backgroundColor: withAlpha(palette.tinta, 0.32) }}
      />
      <PopIn style={{ width: '100%' }}>
        <View className="w-full rounded-[26px] bg-white p-6" style={panelShadow}>
          <Text className="text-center text-[20px] font-extrabold text-tinta">
            ¿Eliminar «{habitName}»?
          </Text>
          <Text className="mt-2 text-center text-[13.5px] leading-[20px] text-gris-500">
            Se borrará el hábito y su historial. Esta acción no se puede deshacer.
          </Text>
          <Pressable
            onPress={onConfirm}
            accessibilityRole="button"
            accessibilityLabel={`Eliminar ${habitName}`}
            className="mt-5 h-[52px] items-center justify-center rounded-[26px] bg-morado"
          >
            <Text className="text-base font-bold text-white">Eliminar</Text>
          </Pressable>
          <Pressable
            onPress={onCancel}
            accessibilityRole="button"
            className="mt-2.5 h-[52px] items-center justify-center rounded-[26px] bg-gris-100"
          >
            <Text className="text-base font-bold text-tinta">Cancelar</Text>
          </Pressable>
        </View>
      </PopIn>
    </View>
  );
}
