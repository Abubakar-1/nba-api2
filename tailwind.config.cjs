/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      display: ["Urbanist", "sans-serif"],
      body: ["Urbanist", "sans-serif"],
      headline: ["Urbanist", "sans-serif"],
    },
    extend: {
      borderWidth: {
        1: "1.5px",
      },
      fontSize: {
        tiny: "12px",
      },
      colors: {
        primary: {
          100: "#E7FFE8",
          400: "#85CD00",
          500: "#009009",
          600: "#028009",
          700: "#F4F461",
        },
        success: {
          500: "#2ADC9D",
          600: "#51B55F",
        },
        danger: {
          100: "#FAF7F8",
        },
      },
      backgroundImage: {
        "test-header": "url('/src/assets/images/nba_logo.png')",
      },
      animation: {
        fadeIn: "fadeIn 0.2s ease-out",
        slideUp: "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".scrollbar-hide": {
          /* IE and Edge */
          "-ms-overflow-style": "none",
          /* Firefox */
          "scrollbar-width": "none",
          /* Safari and Chrome */
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
      });
    },
  ],
};
