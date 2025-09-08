import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./styles/**/*.css"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f7ff",
          500: "#2563eb",
          700: "#1d4ed8",
          900: "#1e3a5f",
        },
      },
    },
  },
  plugins: [],
};

export default config;
