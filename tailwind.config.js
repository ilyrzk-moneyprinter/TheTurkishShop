/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#fefefe',
        glass: 'rgba(255,255,255,0.05)',
        surface: '#ffffff0a',
        accent: '#e30a17',
        price: '#facc15',
        textDark: '#1a1a1a',
        textLight: '#ffffff',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui']
      },
      backdropBlur: {
        md: '12px',
        lg: '20px',
      }
    },
  },
  plugins: [],
} 