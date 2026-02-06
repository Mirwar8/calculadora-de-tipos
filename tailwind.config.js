/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#137fec",
        "background-light": "#f6f7f8",
        "background-dark": "#101922",
        "pokedex-blue-dark": "#0a1c2e",
        "pokedex-blue-light": "#137fec",
        "dex-dark-screen": "#0c1218",
        "type-fire": "#ff9d55",
        "type-water": "#5090d6",
        "type-grass": "#63bc5a",
        "type-electric": "#f4d23c",
        "type-ice": "#73cec0",
        "type-fighting": "#ce4069",
        "type-poison": "#aa6bc8",
        "type-ground": "#d97746",
        "type-flying": "#8fa8dd",
        "type-psychic": "#fa7179",
        "type-bug": "#91c12f",
        "type-rock": "#c5b78c",
        "type-ghost": "#5269ac",
        "type-dragon": "#0b6dc3",
        "type-dark": "#5a5366",
        "type-steel": "#5a8ea1",
        "type-fairy": "#ec8fe6",
        "type-normal": "#9099a1",
        // GBA Colors
        "gba-indigo": "#3f3f9b",
        "gba-indigo-dark": "#2d2d75",
        "gba-gray": "#d1d5db",
        "gba-dark-gray": "#4b5563",
        "gba-screen-frame": "#1a1a1a",
        "gba-background": "#0a0a0c",
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
      borderRadius: {
        "lg": "2rem",
        "xl": "3rem"
      },
      boxShadow: {
        'gba-shell': '0 20px 50px rgba(0,0,0,0.5), inset 2px 2px 4px rgba(255,255,255,0.2), inset -2px -2px 4px rgba(0,0,0,0.4)',
        'gba-button': '0 4px 0 rgba(0,0,0,0.3), inset 1px 1px 1px rgba(255,255,255,0.5)',
        'gba-button-pressed': 'inset 2px 2px 4px rgba(0,0,0,0.5)',
      },
      screens: {
        '3xl': '1600px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
  // Add custom CSS for GBA emulator styles
  // This will be injected into the generated CSS
}
