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
        slate: "var(--slate)",
        bone: "var(--bone)",
        paper: "var(--paper)",
        petrol: "var(--petrol)",
        oxblood: "var(--oxblood)",
        moss: "var(--moss)"
      },
      boxShadow: {
        card: "0 18px 38px -24px rgba(23, 23, 23, 0.16)",
        panel: "0 20px 50px -28px rgba(23, 23, 23, 0.22)"
      }
    },
  },
  plugins: [],
}
