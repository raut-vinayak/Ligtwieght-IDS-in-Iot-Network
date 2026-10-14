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
        canvas: "#F0F2F5",
        surface: "#FFFFFF",
        border: "#CACED6",
        ink: "#0B0D17",
        navy: "#29315D",
        "navy-dark": "#1E2445",
        blue: "#0A24E9",
        indigo: "#152EAE",
        muted: "#8C9BA5",
        positive: "#5C9764",
        danger: "#C94040",
        warning: "#C47B18",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
