import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: "#004C1B",
          50: "#e6f5ed",
          100: "#b3e0c8",
          200: "#80cca3",
          300: "#4db77e",
          400: "#1aa359",
          500: "#004C1B",
          600: "#003d16",
          700: "#002e11",
          800: "#001f0b",
          900: "#000f06",
        },
        pitch: {
          DEFAULT: "#00e68a",
          50: "#e6fff5",
          100: "#b3ffe0",
          200: "#80ffcc",
          300: "#4dffb8",
          400: "#1affa3",
          500: "#00e68a",
          600: "#00b36b",
          700: "#00804d",
          800: "#004d2e",
          900: "#001a10",
        },
        ink: {
          DEFAULT: "#0a0a0a",
          light: "#1a1a1a",
        },
        chalk: "#f7f8f6",
        slate: {
          50: "#f5f5f7",
          100: "#e8e8ed",
          200: "#d1d1d6",
          300: "#b4b4bb",
          400: "#86868b",
          500: "#6e6e73",
          600: "#48484a",
          700: "#3a3a3c",
          800: "#2c2c2e",
          900: "#1c1c1e",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-montserrat)", "system-ui", "sans-serif"],
        display: ["var(--font-anton)", "Impact", "Haettenschweiler", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 24px rgba(0, 230, 138, 0.35)",
        "glow-sm": "0 0 12px rgba(0, 230, 138, 0.25)",
      },
      backgroundImage: {
        "hash-lines":
          "repeating-linear-gradient(90deg, rgba(247,248,246,0.08) 0px, rgba(247,248,246,0.08) 2px, transparent 2px, transparent 64px)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
