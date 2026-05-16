/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        iron: "#0A0A0A",
        charcoal: "#111418",
        plate: "#1A1F26",
        steel: "#252C35",
        fire: "#FF4500",
        ember: "#FF6B35",
        gold: "#FFB800",
        chalk: "#E8E8E0",
        mist: "#8B9099",
        bgPrimary: "var(--bg-primary)",
        bgSecondary: "var(--bg-secondary)",
        bgAccent: "var(--bg-accent)",
        textPrimary: "var(--text-primary)",
        textSecondary: "var(--text-secondary)",
        brandPrimary: "var(--color-primary)",
        brandSecondary: "var(--color-secondary)",
        brandAccent: "var(--color-accent)",
        borderSubtle: "var(--border-subtle)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)"
      },
      fontFamily: {
        sans: ['"Barlow"', "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        display: ['"Bebas Neue"', "sans-serif"],
        heading: ['"Barlow Condensed"', '"Barlow"', "sans-serif"],
        body: ['"Barlow"', "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        cond: ['"Barlow Condensed"', "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"]
      }
    }
  },
  plugins: []
};
