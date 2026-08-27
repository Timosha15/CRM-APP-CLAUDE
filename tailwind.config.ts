import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2f1ff",
          100: "#e7e5ff",
          200: "#d3cfff",
          300: "#b3a9ff",
          400: "#8f7bff",
          500: "#6d4cff",
          600: "#5b2cf5",
          700: "#4c1fd8",
          800: "#3f1ba9",
          900: "#361b85",
          950: "#210f57",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
