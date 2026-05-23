import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0A0A0A",
        card: "#111111",
        accent: "#2563EB",
        success: "#16A34A",
        warning: "#D97706",
        error: "#DC2626",
        "text-primary": "#F9FAFB",
        "text-muted": "#6B7280",
        border: "#1F2937",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["DM Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
