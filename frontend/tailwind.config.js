/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#003087", // JECRC Navy Blue
        secondary: "#E8A020", // Gold Accent
        "primary-container": "#0a1f44",
        "secondary-container": "#E8A020", // Gold/Amber
        "on-background": "#0b1c30",
        "on-surface-variant": "#44464e",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        error: "#ba1a1a",
        "surface-container": "#eff4ff",
        outline: "#75777f",
        "outline-variant": "#c5c6cf",
      },
      fontFamily: {
        sora: ["Sora", "sans-serif"],
        dm: ["DM Sans", "sans-serif"],
      },
      spacing: {
        xl: "80px",
        margin: "32px",
        lg: "48px",
        base: "8px",
        xs: "4px",
        gutter: "24px",
        sm: "12px",
        md: "24px",
      },
      borderRadius: {
        xl: "0.75rem",
      },
    },
  },
  plugins: [],
}
