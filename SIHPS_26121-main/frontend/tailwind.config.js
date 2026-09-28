/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        palette: {
          indigo: '#1E293B',
          cornflower: '#06B6D4',
          periwinkle: '#38BDF8',
          platinum: '#F8FAFC',
          orange: '#F59E0B',
        },
        navy: {
          950: '#ffffff', // Ultra deep space background
          900: '#ffffff', // Modern slate-navy main background
          850: '#ffffff', // Card base
          800: '#152037', // Elevated card surface
          700: '#1E2E4A', // Borders & hover states
          600: '#2E4369', // Subtle borders
          500: '#476391', // Muted text/accents
        },
        teal: {
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2',
        },
        amber: {
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
        purple: {
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
        },
        orange: {
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
        },
        platinum: {
          DEFAULT: '#F8FAFC',
          light: '#FFFFFF',
          dark: '#E2E8F0',
        },
        slate: {
          850: '#ffffff',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
