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
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        display: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        heading: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        body: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"]
      }
    }
  },
  plugins: []
};
