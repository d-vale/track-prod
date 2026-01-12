/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        noir: 'var(--noir)',
        orange: 'var(--orange)',
        base: 'var(--base)',
        secondary: 'var(--secondary)',
        'gris-fonce': 'var(--gris-fonce)',
        'separation-grise': 'var(--separation-grise)',
      },
      borderColor: {
        separation: 'var(--separation-grise-opacity)',
      },
      fontFamily: {
        inter: 'var(--font-family)',
      },
    },
  },
  plugins: [],
}
