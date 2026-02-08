/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'hkust-blue': '#003366',
        'hkust-gold': '#C5A059',
      },
    },
  },
  plugins: [],
}
