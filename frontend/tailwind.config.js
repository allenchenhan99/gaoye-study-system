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
        paper: { DEFAULT: "#D8D7D1", deep: "#C7C6C0" },
        surface: { DEFAULT: "#F4F2E9", raised: "#FFFFFF" },
        ink: { DEFAULT: "#24262B", soft: "#55575C", faint: "#777873" },
        line: { DEFAULT: "#777873", strong: "#24262B" },
        pine: { DEFAULT: "#315C8C", 600: "#274B72", 500: "#4775A2" },
        gold: { DEFAULT: "#C93636", soft: "#E9CACA", deep: "#9C2929" },
      },
      fontFamily: {
        serif: ['"PingFang TC"', '"Noto Sans TC"', "system-ui", "sans-serif"],
        sans: ['"PingFang TC"', '"Noto Sans TC"', "system-ui", "sans-serif"],
        mono: ["Menlo", "Monaco", "Consolas", "ui-monospace", "monospace"],
      },
      borderRadius: { xl2: "0" },
      boxShadow: {
        card: "4px 4px 0 #A9A8A2",
        "card-hover": "7px 7px 0 #8F908B",
        inset: "inset 3px 3px 0 rgba(255,255,255,.65), inset -3px -3px 0 rgba(36,38,43,.22)",
      },
      keyframes: {
        fadeRise: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "none" },
        },
        pop: {
          "0%": { transform: "scale(1)" },
          "45%": { transform: "scale(1.015)" },
          "100%": { transform: "scale(1)" },
        },
        shake: {
          "10%,90%": { transform: "translateX(-1px)" },
          "20%,80%": { transform: "translateX(2px)" },
          "30%,50%,70%": { transform: "translateX(-3px)" },
          "40%,60%": { transform: "translateX(3px)" },
        },
      },
      animation: {
        "fade-rise": "fadeRise .18s steps(3, end) both",
        pop: "pop .28s steps(3, end)",
        shake: "shake .32s steps(4, end)",
      },
    },
  },
  plugins: [],
};
