/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Institutional Navy (Primary Brand - Solidity & Trust)
        navy: {
          50: '#F0F3F9',
          100: '#DCE3F1',
          200: '#BDCBE5',
          300: '#94ACD4',
          400: '#6789C0',
          500: '#466BAA',
          600: '#35538D',
          700: '#2C4372',
          800: '#233157',
          900: '#1C2541',
          950: '#0B132B',
        },
        // Growth Emerald & Teal (Academic Achievement, Settled Finance)
        emerald: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
          950: '#022C22',
        },
        // High Contrast Slate Surfaces
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#0A0F1D',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        lg: '0.625rem',
        md: '0.5rem',
        sm: '0.375rem',
      },
      boxShadow: {
        'institutional': '0 1px 3px 0 rgba(11, 19, 43, 0.08), 0 1px 2px -1px rgba(11, 19, 43, 0.08)',
        'institutional-md': '0 4px 6px -1px rgba(11, 19, 43, 0.08), 0 2px 4px -2px rgba(11, 19, 43, 0.08)',
        'institutional-lg': '0 10px 15px -3px rgba(11, 19, 43, 0.08), 0 4px 6px -4px rgba(11, 19, 43, 0.08)',
      },
    },
  },
  plugins: [],
};
