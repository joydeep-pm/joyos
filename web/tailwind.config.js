/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "var(--ink)",
        cloud: "var(--cloud)",
        mint: "var(--mint)",
        amber: "var(--amber)",
        slate: "var(--slate)"
      },
      boxShadow: {
        card: "0 16px 30px -18px rgba(15, 31, 44, 0.35)",
        panel: "0 24px 45px -24px rgba(15, 31, 44, 0.4)"
      }
    },
  },
  plugins: [],
}
