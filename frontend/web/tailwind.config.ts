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
        ink: "#0f172a",
        panel: "#111827",
        line: "#1f2937",
        soft: "#94a3b8",
        accent: "#14b8a6",
        accent2: "#f59e0b"
      },
      boxShadow: {
        panel: "0 20px 45px rgba(2, 6, 23, 0.28)"
      },
      backgroundImage: {
        grid: "linear-gradient(to right, rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.08) 1px, transparent 1px)"
      },
      backgroundSize: {
        grid: "32px 32px"
      }
    }
  },
  plugins: []
};

export default config;
