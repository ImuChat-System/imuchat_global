import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#059669',
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        accent: {
          DEFAULT: '#f59e0b',
          light: '#fcd34d',
          dark: '#d97706',
        },
        finance: {
          dark: '#0a0a0a',
          darker: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      backgroundImage: {
        'gradient-finance': 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0a0a0a 0%, #111827 100%)',
        'gradient-card': 'linear-gradient(135deg, #0a0a0a 0%, #059669 100%)',
      },
    },
  },
  plugins: [],
  darkMode: ['class', '[data-theme="dark"]'],
};

export default config;
