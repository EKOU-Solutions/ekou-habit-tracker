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
        'morado-claro': '#C265A4',
        'gris-600': '#6B7290',
        'gris-500': '#8A90A8',
        'gris-400': '#AAB0C6',
        'gris-350': '#B0B5C8',
        'gris-300': '#C3C8D9',
        'gris-250': '#E7E9F1',
        'gris-200': '#D8DCEA',
        'gris-150': '#EDEFF6',
        'gris-100': '#F1F3FA',
        'gris-50': '#F8F9FD',
        pista: '#E2E5F0',
        fondo: '#F9F9F9',
        'anillo-track': '#E9EBF4',
        'anillo-track-riesgo': '#F3E2ED',
      },
    },
  },
  plugins: [],
};
