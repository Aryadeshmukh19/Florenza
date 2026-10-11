module.exports = {
  content: ["./src/**/*.{jsx,js}"],
  theme: {
    extend: {
      colors: {
        night: "#071A12", deep: "#0D2B1E", emerald: "#174F35", botanic: "#2F704A",
        moss: "#6E8F6B", sage: "#A9B9A2", "sage-lit": "#C9D6C1", mist: "#DDE4D8",
        cream: "#F2EFE5", ivory: "#FAF9F3", earth: "#92775A", gold: "#B59A65",
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', '"Playfair Display"', "Georgia", "serif"],
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
    },
  },
};
