/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#006d77",
        secondary: "#83c5be",
        background: "#edf6f9",
        surface: "#ffddd2",
        accent: "#e29578",
      }
    },
  },
  plugins: [],
}
