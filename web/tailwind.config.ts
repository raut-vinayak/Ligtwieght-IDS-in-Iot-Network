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
        canvas: "#F1F5F9", // Slate-100: provides crisp, distinct contrast behind white cards
        surface: "#FFFFFF",
        "surface-subtle": "#F8FAFC",
        border: "#E2E8F0",
        "border-strong": "#CBD5E1",
        ink: "#0F172A",
        muted: "#64748B",
        faint: "#94A3B8",
        navy: "#0F172A",
        "navy-dark": "#0B0F19",
        "navy-panel": "#1E293B",
        blue: "#2563EB",
        indigo: "#3B82F6",
        positive: "#10B981",
        danger: "#EF4444",
        warning: "#F59E0B",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "Menlo", "Consolas", "monospace"],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(15, 23, 42, 0.05)",
        card: "0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)",
        lifted: "0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.04)",
        float: "0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.06)",
      },
    },
  },
  plugins: [],
};
export default config;
