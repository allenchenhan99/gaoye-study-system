/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: "#F4EFE4", deep: "#EBE3D2" },
        surface: { DEFAULT: "#FBF8F1", raised: "#FFFFFF" },
        ink: { DEFAULT: "#211E17", soft: "#5C574B", faint: "#8A8471" },
        line: { DEFAULT: "#E2DAC8", strong: "#D2C7AF" },
        pine: { DEFAULT: "#17493A", 600: "#1E6B52", 500: "#2A8067" },
        gold: { DEFAULT: "#B8862F", soft: "#E9D9AE", deep: "#8A6220" },
        correct: { DEFAULT: "#1E6B52", bg: "#E4EFE6" },
        wrong: { DEFAULT: "#A8321F", bg: "#F6E5DF" },
      },
      fontFamily: {
        serif: ['"Noto Serif TC"', "Georgia", "serif"],
        sans: ['"Noto Sans TC"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
      borderRadius: { xl2: "1.15rem" },
      boxShadow: {
        card: "0 1px 2px rgba(33,30,23,.05), 0 10px 30px -16px rgba(33,30,23,.22)",
        "card-hover": "0 2px 6px rgba(33,30,23,.07), 0 20px 44px -18px rgba(33,30,23,.30)",
        inset: "inset 0 1px 0 rgba(255,255,255,.7)",
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
        "fade-rise": "fadeRise .5s cubic-bezier(.22,1,.36,1) both",
        pop: "pop .45s ease-out",
        shake: "shake .4s ease-in-out",
      },
    },
  },
  plugins: [],
};
