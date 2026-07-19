/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Paleta EKOU (doc/ux-ui-guidelines.md §2.1)
        marino: '#001A70',
        aguamarina: '#2DCCD3',
        'teal-profundo': '#0E7C81',
        morado: '#AF0F7D',
        ciruela: '#4B1268',
        tinta: '#101C4D',
        'gris-600': '#6B7290',
        'gris-500': '#8A90A8',
        'gris-300': '#C3C8D9',
        'gris-100': '#F1F3FA',
        fondo: '#F9F9F9',
      },
    },
  },
  plugins: [],
};
