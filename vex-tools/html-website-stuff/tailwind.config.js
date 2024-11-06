/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./Calculator.html",
    "./src/**/*.{html,js}",
    "./scripts/**/*.js"
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          "primary": "#38bdf8",
          "secondary": "#818cf8",
          "accent": "#f471b5",
          "neutral": "#e5e7eb",
          "base-100": "#f3f4f6",
          "info": "#0ea5e9",
          "success": "#4ade80",
          "warning": "#fbbf24",
          "error": "#f87171",
        },
      },
      {
        dark: {
          "primary": "#38bdf8",
          "secondary": "#818cf8",
          "accent": "#f471b5",
          "neutral": "#1e293b",
          "base-100": "#0f172a",
          "info": "#0ea5e9",
          "success": "#4ade80",
          "warning": "#fbbf24",
          "error": "#f87171",
        },
      }
    ],
  },
}
