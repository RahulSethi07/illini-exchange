/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // UIUC Brand Colors
        'illini-orange': '#E84A27',
        'illini-blue': '#13294B',
        'illini-orange-dark': '#C73E1D',
        'illini-blue-light': '#1E3A5F',
        'illini-orange-light': '#FF6B4A',
        // Supporting colors
        'cloud': '#F8F8F8',
        'heritage': '#0455A4',
        'industrial': '#5D5D5D',
      },
      fontFamily: {
        'display': ['Montserrat', 'sans-serif'],
        'body': ['Source Sans Pro', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'card': '0 2px 8px rgba(19, 41, 75, 0.08)',
        'card-hover': '0 8px 24px rgba(19, 41, 75, 0.12)',
        'nav': '0 2px 12px rgba(19, 41, 75, 0.1)',
      }
    },
  },
  plugins: [],
}

