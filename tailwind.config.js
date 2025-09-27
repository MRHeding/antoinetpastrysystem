/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./admin/*.html",
    "./js/*.js",
    "./admin/js/*.js"
  ],
  theme: {
    extend: {
      colors: {
        'bakery': {
          50: '#fefdf8',
          100: '#fef9e7',
          200: '#fdf2d1',
          300: '#fce7b0',
          400: '#f9d584',
          500: '#f5c157',
          600: '#e6a847',
          700: '#d18d3a',
          800: '#b07332',
          900: '#8f5e2e',
        }
      },
      fontFamily: {
        'bakery': ['Georgia', 'serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
      }
    },
  },
  plugins: [],
}
