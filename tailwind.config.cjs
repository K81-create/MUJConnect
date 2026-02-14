/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
    },
    extend: {
      /* =====================
         FONTS
      ===================== */
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },

      /* =====================
         COLORS (MUJConnect Theme)
      ===================== */
      colors: {
        background: "hsl(210 40% 98%)",
        foreground: "hsl(222 47% 11%)",

        primary: {
          DEFAULT: "#16A34A", // MUJConnect green
          foreground: "#FFFFFF",
        },

        secondary: {
          DEFAULT: "#ECFDF5",
          foreground: "#065F46",
        },

        muted: {
          DEFAULT: "#F0FDF4",
          foreground: "#166534",
        },

        accent: {
          DEFAULT: "#DCFCE7",     // neutral grey (no blue)
          foreground: "#166534",
        },

        success: "#22C55E",
        warning: "#EA580C",

        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
        },

        card: {
          DEFAULT: "#FFFFFF",
          foreground: "hsl(222 47% 11%)",
        },

        border: "#E5E7EB",
        input: "#E5E7EB",
        ring: "#16A34A", // black focus ring
      },

      /* =====================
         RADIUS & SHADOW
      ===================== */
      borderRadius: {
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
      },

      boxShadow: {
        soft: "0 10px 30px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};