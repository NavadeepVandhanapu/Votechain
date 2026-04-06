/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        forestDark: "#0D3B2E",
        forestMid: "#155E43",
        forest: "#1D7A56",
        forestLight: "#2A9968",

        gold: "#D4AF37",
        goldDark: "#B8962E",
        goldSoft: "#FDF3D0",

        bgPage: "#F5F7F0",
        bgCard: "#FFFFFF",
        bgMint: "#EDFAF4",

        textPrimary: "#1A2E1F",
        textSecondary: "#4B6357",
        textHint: "#8FA899",

        border: "#D6E8DC",

        success: "#16A34A",
        error: "#DC2626",
        warning: "#D97706",
      },

      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
      },

      borderRadius: {
        card: "16px",
        button: "12px",
      },

      boxShadow: {
        card: "0 4px 16px rgba(13,59,46,0.05)",
        hover: "0 20px 40px rgba(13,59,46,0.12)",
        button: "0 6px 20px rgba(13,59,46,0.22)",
      },
    },
  },
  plugins: [],
};