import { View } from 'react-native';

import { GradientText } from '@/components/GradientText';
import { softBadgeShadow } from '@/theme/shadows';

/** Avatar circular con la inicial del apodo en gradiente (header de Home / día cero). */
export function AvatarBadge({ nickname }: { nickname: string }) {
  return (
    <View
      className="h-10 w-10 items-center justify-center rounded-full bg-white"
      style={softBadgeShadow}
    >
      <GradientText className="text-base font-bold">
        {(nickname || '?').charAt(0).toUpperCase()}
      </GradientText>
    </View>
  );
}
