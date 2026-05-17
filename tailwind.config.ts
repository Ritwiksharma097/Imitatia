import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
      },
      colors: {
        ink: "var(--ink)",
        paper: "var(--paper)",
        muted: "var(--muted)",
        line: "var(--line)",
        accent: "var(--accent)",
        "accent-soft": "var(--accent-soft)",
        chip: "var(--chip)",
      },
      maxWidth: {
        prose: "68ch",
        wide: "1280px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "drift": {
          "0%, 100%": { transform: "translate(0,0)" },
          "50%": { transform: "translate(6px,-4px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
        "drift": "drift 8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
