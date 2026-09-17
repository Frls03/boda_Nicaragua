/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#16233f',
        navyDeep: '#0f1a30',
        navyCard: '#20304f',
        cream: '#f4efe4',
        creamDark: '#ded6c4',
        maroon: '#6b1620',
        maroonDeep: '#4a0d14',
        gold: '#c9a227',
        ink: '#1b1b1b',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        script: ['"Great Vibes"', 'cursive'],
        sans: ['"Montserrat"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
