import type { Config } from "tailwindcss";
// trigger rebuild

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        card: "var(--card-bg)",
        primary: "#FF8A00",
        darkAccent: "#111827",
        textMain: "var(--text-main)",
        textMuted: "var(--text-muted)",
        border: "var(--border-color)",
      },
    },
  },
  plugins: [],
};
export default config;
