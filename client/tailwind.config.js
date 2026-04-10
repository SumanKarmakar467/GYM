/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
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
        display: ["Bebas Neue", "sans-serif"],
        heading: ["Montserrat", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      }
    }
  },
  plugins: []
};