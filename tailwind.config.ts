import type { Config } from "tailwindcss";

const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: v("bg"),
        surface: v("surface"),
        "pink-soft": v("pink-soft"),
        "pink-strong": v("pink-strong"),
        danger: v("danger"),
        success: v("success"),
        warning: v("warning"),
        ink: v("text"),
        muted: v("muted"),
        line: v("line"),
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      borderRadius: { card: "16px" },
    },
  },
  plugins: [],
} satisfies Config;
