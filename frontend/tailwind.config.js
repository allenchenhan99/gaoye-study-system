/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        machine: "#D8D7D1",
        charcoal: "#24262B",
        instruction: "#C93636",
        crt: "#315C8C",
        document: "#F4F2E9",
        correct: { DEFAULT: "#2F7755", bg: "#DDEBE3" },
        wrong: { DEFAULT: "#B33535", bg: "#F0DADA" },
        warning: { DEFAULT: "#A66A16", bg: "#F2E6CF" },
        ink: { DEFAULT: "#24262B", soft: "#55575C", faint: "#777873" },
        line: { DEFAULT: "#777873", strong: "#24262B" },
      },
      fontFamily: {
        sans: ['"PingFang TC"', '"Noto Sans TC"', "system-ui", "sans-serif"],
        mono: ["Menlo", "Monaco", "Consolas", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
