import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0b0f17",
        surface: {
          50: "#18202f",
          100: "#131b28",
          200: "#0f1622",
          DEFAULT: "#131b28",
        },
        border: "#1f2a3d",
        muted: {
          DEFAULT: "#8f9bb3",
          foreground: "#65728a",
        },
        accent: {
          indigo: "#4f46e5",
          saffron: "#f59e0b",
          sakura: "#f43f5e",
          emerald: "#10b981",
          teal: "#14b8a6",
        },
        primary: {
          50: "#eef2ff",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          DEFAULT: "#6366f1",
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
