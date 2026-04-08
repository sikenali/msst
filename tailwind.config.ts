import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ssq: {
          primary: '#EF4444',
          secondary: '#F97316',
          dark: '#B45309',
          darker: '#92400E',
        },
        dlt: {
          primary: '#3B82F6',
          secondary: '#6366F1',
          dark: '#1D4ED8',
          darker: '#1E40AF',
        },
      },
      fontFamily: {
        sans: ['SourceHanSans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
