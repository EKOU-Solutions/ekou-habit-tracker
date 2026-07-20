const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// inlineRem 16: NativeWind usa rem=14 en nativo por defecto, encogiendo h-14, text-base, etc.
// respecto al diseño (y a web, donde 1rem=16px).
module.exports = withNativeWind(config, { input: './global.css', inlineRem: 16 });
