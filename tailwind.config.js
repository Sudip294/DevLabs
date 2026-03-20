/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0a0a0a', // Deep background
          800: '#171717', // Secondary background
          700: '#262626', // Border / Hover
        },
        primary: {
          500: '#6366f1', // Indigo primary
          600: '#4f46e5',
        }
      }
    },
  },
  plugins: [],
}
