/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: '#e30a17',
        textLight: '#ffffff',
        textDark: '#111827',
        surface: 'rgba(255, 255, 255, 0.05)',
        price: '#facc15',
        dark: {
          bg: '#0f172a',
          surface: 'rgba(0, 0, 0, 0.2)',
          text: '#f8fafc',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Geist Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 8px 24px rgba(0, 0, 0, 0.06)',
        'glass': '0 4px 24px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.03)',
        'button': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'hover': '0 12px 32px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-slow': 'bounce 2s ease-in-out infinite',
      },
      borderRadius: {
        '2.5xl': '20px',
      },
      transitionTimingFunction: {
        'ios': 'cubic-bezier(0.25, 0.1, 0.25, 1.0)',
        'bounce': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}

