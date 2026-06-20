import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bunny: {
          cream: "#fff7ef",
          milk: "#fffdf9",
          blush: "#ffd7dc",
          rose: "#ee8d99",
          cocoa: "#6b4f46",
          sage: "#9ab59f",
          honey: "#f1bd75",
          lavender: "#cab7df"
        }
      },
      boxShadow: {
        cozy: "0 18px 48px rgba(124, 83, 70, 0.14)",
        soft: "0 10px 28px rgba(124, 83, 70, 0.10)"
      },
      borderRadius: {
        cozy: "24px"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: [],
} satisfies Config;
