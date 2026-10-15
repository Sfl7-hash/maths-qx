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
        holo: {
          cyan: "#00f5ff",
          violet: "#8b5cf6",
          pink: "#ec4899",
          blue: "#3b82f6",
          dark: "#020817",
          darker: "#010610",
          surface: "#0a1628",
          panel: "#0d1f3c",
          border: "#1e3a5f",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "holo-gradient": "linear-gradient(135deg, #020817 0%, #0a1628 50%, #020817 100%)",
        "cyan-glow": "radial-gradient(ellipse at center, rgba(0,245,255,0.15) 0%, transparent 70%)",
        "violet-glow": "radial-gradient(ellipse at center, rgba(139,92,246,0.15) 0%, transparent 70%)",
        "grid-pattern": "linear-gradient(rgba(0,245,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid": "40px 40px",
      },
      animation: {
        "holo-pulse": "holo-pulse 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "scan-line": "scan-line 4s linear infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "rotate-slow": "rotate-slow 20s linear infinite",
        "fade-in-up": "fade-in-up 0.6s ease-out",
        "shimmer": "shimmer 2s linear infinite",
        "typing": "typing 2s steps(30) forwards",
      },
      keyframes: {
        "holo-pulse": {
          "0%, 100%": { opacity: "0.8", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.02)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0,245,255,0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(0,245,255,0.8), 0 0 80px rgba(0,245,255,0.4)" },
        },
        "rotate-slow": {
          "from": { transform: "rotate(0deg)" },
          "to": { transform: "rotate(360deg)" },
        },
        "fade-in-up": {
          "from": { opacity: "0", transform: "translateY(20px)" },
          "to": { opacity: "1", transform: "translateY(0)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "typing": {
          "from": { width: "0" },
          "to": { width: "100%" },
        },
      },
      boxShadow: {
        "cyan-glow": "0 0 20px rgba(0,245,255,0.4), 0 0 60px rgba(0,245,255,0.2)",
        "violet-glow": "0 0 20px rgba(139,92,246,0.4), 0 0 60px rgba(139,92,246,0.2)",
        "panel": "0 0 0 1px rgba(0,245,255,0.1), 0 4px 40px rgba(0,245,255,0.05), inset 0 0 40px rgba(0,245,255,0.02)",
      },
    },
  },
  plugins: [],
};

export default config;
