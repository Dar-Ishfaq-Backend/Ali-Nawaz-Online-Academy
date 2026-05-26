/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0A1628',
          dark: '#060E1A',
          card: '#0F1E35',
          border: '#1C2E4A',
        },
        green: {
          DEFAULT: '#1B6B4A',
          light: '#2A8B62',
          muted: '#14503A',
        },
        emerald: {
          950: '#060E1A',
          900: '#0A1628',
          800: '#0F1E35',
          700: '#14503A',
          600: '#1B6B4A',
          500: '#2A8B62',
          400: '#7DC9A4',
        },
        gold: {
          DEFAULT: '#D4A853',
          light: '#E8C070',
          muted: '#A8823D',
          50:  '#fff8e6',
          100: '#f7e7bd',
          200: '#efd590',
          300: '#e8c070',
          400: '#d4a853',
          500: '#c3923f',
          600: '#a8823d',
          700: '#7f632f',
        },
        cream: {
          DEFAULT: '#E8DCC8',
          muted: '#B8AC98',
        },
        slate: { muted: '#8B9BB4' },
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        crimson: ['Nunito', 'system-ui', 'sans-serif'],
        body: ['Nunito', 'system-ui', 'sans-serif'],
        display: ['Cinzel', 'serif'],
        amiri: ['Amiri', 'serif'],
      },
      backgroundImage: {
        'geometric': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23065f46' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
      },
      boxShadow: {
        gold: '0 0 20px rgba(212, 168, 83, 0.15)',
        'gold-lg': '0 0 40px rgba(212, 168, 83, 0.2)',
        green: '0 0 20px rgba(27, 107, 74, 0.2)',
        glass: '0 4px 30px rgba(0, 0, 0, 0.4)',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        glow: { '0%': { boxShadow: '0 0 5px #f59e0b44' }, '100%': { boxShadow: '0 0 20px #f59e0b88, 0 0 40px #f59e0b22' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
}
