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
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
      borderRadius: {
        "lg": "2rem",
        "xl": "3rem"
      },
    },
  },
  plugins: [],
}
