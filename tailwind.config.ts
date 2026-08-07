import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        nunito: ["Nunito", "sans-serif"],
        inter:  ["Inter",  "sans-serif"],
      },
      colors: {
        bg:         "#F7F4EF",
        ink:        "#26231E",
        "ink-mid":  "#5C5850",
        "ink-lt":   "#9B9690",
        sage:       "#D4E8CC",
        "sage-dk":  "#6E9E65",
        "sage-icon":"#B5D9A8",
        peach:      "#F2DDD3",
        "peach-icon":"#E8BFB0",
        gold:       "#EFE4C0",
        "gold-icon":"#DECE96",
        lav:        "#DDD8F2",
        "lav-dk":   "#BCB5E8",
        "lav-deep": "#8880CC",
        coral:      "#F5D8D5",
        "coral-icon":"#EDADA8",
        sky:        "#CCE3F0",
        "sky-icon": "#A4CADF",
        mint:       "#C8EAE2",
        "mint-icon":"#96D4C6",
        blush:      "#F0D8E8",
        "blush-icon":"#E0AECF",
      },
      borderRadius: {
        "2xl": "22px",
        "3xl": "32px",
      },
    },
  },
  plugins: [],
};
export default config;
