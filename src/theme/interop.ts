import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import Animated from 'react-native-reanimated';

// NativeWind solo interopera los componentes core de react-native; sin estos registros,
// className sobre LinearGradient o Animated.View se ignora en silencio (sin radio, sin flex…).
cssInterop(LinearGradient, { className: 'style' });
cssInterop(Animated.View, { className: 'style' });
