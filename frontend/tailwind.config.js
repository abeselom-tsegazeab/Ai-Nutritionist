/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Use class strategy
  theme: {
    extend: {
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'fade-in': 'fadeIn 1s forwards',
        'float': 'float 3s ease-in-out infinite',
        'button-float': 'buttonFloat 3s ease-in-out infinite',
        'text-glow': 'textGlow 2s ease-in-out infinite',
        'card-hover': 'cardHover 0.3s ease',
      },
      keyframes: {
        textGlow: {
          '0%': { filter: 'drop-shadow(0 0 5px rgba(96, 165, 250, 0.5))' },
          '50%': { filter: 'drop-shadow(0 0 20px rgba(96, 165, 250, 0.8))' },
          '100%': { filter: 'drop-shadow(0 0 5px rgba(96, 165, 250, 0.5))' },
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        float: {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(0px)' },
        },
        buttonFloat: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
          '100%': { transform: 'translateY(0)' },
        },
        cardHover: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}