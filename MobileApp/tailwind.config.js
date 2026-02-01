/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Include all source paths that use NativeWind classes (expo-router uses `app/`).
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./App.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
