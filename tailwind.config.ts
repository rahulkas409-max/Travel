import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}", "./data/**/*.ts"],
  theme: {
    extend: {
      colors: {
        sand: {
          50: "#fdfbf8",
          100: "#faf7f2",
          200: "#f3ece0",
          300: "#e8dcc7",
          400: "#d6c3a2",
        },
        slate: {
          950: "#0b0f19",
        },
        marigold: {
          DEFAULT: "#f59e0b",
          50: "#fffbeb",
          100: "#fef3c7",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        },
        rose: {
          DEFAULT: "#e06d53",
          50: "#fdf4f1",
          100: "#fbe6df",
          300: "#f0a592",
          400: "#e98670",
          500: "#e06d53",
          600: "#c9553c",
          700: "#a8432e",
        },
        sage: {
          DEFAULT: "#588157",
          50: "#f2f6f1",
          100: "#e1eadf",
          300: "#a3bda1",
          400: "#7a9e78",
          500: "#588157",
          600: "#466a45",
          700: "#385537",
        },
        ink: "#1c1917",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        hand: ["var(--font-hand)", "cursive"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(28,25,23,0.04), 0 8px 24px -12px rgba(28,25,23,0.18)",
        lift: "0 12px 40px -12px rgba(224,109,83,0.4)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        shimmer: "shimmer 1.4s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
