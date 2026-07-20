import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';

// NativeWind solo interopera los componentes core de react-native; sin este registro,
// className sobre LinearGradient se ignora en silencio (sin radio, sin padding).
// OJO: NO registrar componentes de Reanimated (Animated.View): su pipeline de props
// ignora el interop en nativo aunque funcione en web — usar objetos style en ellos.
cssInterop(LinearGradient, { className: 'style' });
