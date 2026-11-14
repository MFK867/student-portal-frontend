/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tuf: {
          primary: "#0A2540",
          navy: "#0C1E36",
          dark: "#0B1320",
          slate: "#1E293B",
          subtle: "#F1F5F9",
          bg: "#F8FAFC",
          charcoal: "#0F172A",
          muted: "#64748B",
          border: "#E2E8F0"
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
