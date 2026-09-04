/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        loveons: {
          50: '#FFF1F5',
          100: '#FFE4EC',
          200: '#FFC9DA',
          300: '#FF9DC2',
          400: '#FF73B5',
          500: '#FF4D8D',
          600: '#FF2F6D',
          700: '#E61A57',
          800: '#CC0F48',
          900: '#A30D3A',
        },
      },
      fontFamily: {
        // 👇 Yeh Google Font aapke dikhaye gaye screenshot se 100% match karega
        serif: ['Merriweather', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
