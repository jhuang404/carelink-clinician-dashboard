/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // T-Mobile Magenta theme
        magenta: {
          50: '#fef1f6',
          100: '#fde6ef',
          200: '#fccce0',
          300: '#faa3c7',
          400: '#f56da3',
          500: '#ec4080',
          600: '#E20074', // T-Mobile primary
          700: '#c4005f',
          800: '#a2004f',
          900: '#860044',
        },
      },
    },
  },
  plugins: [],
};
