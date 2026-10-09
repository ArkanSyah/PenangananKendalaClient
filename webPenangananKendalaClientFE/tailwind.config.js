/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#005662',
          hover: '#003d46',
          container: '#005662',
          tint: 'rgba(0, 86, 98, 0.05)',
        },
        secondary: '#48626e',
        canvas: '#f8f9fa',
        surface: '#ffffff',
        border: {
          DEFAULT: '#e0e0e0',
          active: '#005662',
          modal: '#cfd8dc',
        },
        text: {
          primary: '#191c1d',
          secondary: '#3f484a',
          muted: '#6f797b',
        },
        status: {
          success: '#10b981',
          warning: '#fbc02d',
          danger: '#c62828',
          info: '#3b82f6',
        }
      },
      fontFamily: {
        sans: ['Open Sans', 'sans-serif'],
      },
      borderRadius: {
        sm: '4px',
        lg: '8px',
      }
    },
  },
  plugins: [],
}
