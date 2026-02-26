/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      colors: {
        brand: {
          50: '#faf8f5',
          100: '#f3efe8',
          200: '#e5ddd0',
          300: '#d4c5ae',
          400: '#bfa786',
          500: '#a68b65',
          600: '#8d7352',
          700: '#725c42',
          800: '#5c4a37',
          900: '#3d3126',
        },
        accent: {
          50: '#fdf8ef',
          100: '#fbefd9',
          200: '#f6dbb2',
          300: '#f0c280',
          400: '#e9a34c',
          500: '#e38b27',
          600: '#d4711d',
          700: '#b0561a',
          800: '#8d441c',
          900: '#73391a',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'premium': '0 1px 2px 0 rgb(0 0 0 / 0.03), 0 1px 6px -1px rgb(0 0 0 / 0.04), 0 2px 16px -2px rgb(0 0 0 / 0.04)',
        'premium-lg': '0 4px 24px -4px rgb(0 0 0 / 0.08), 0 2px 8px -2px rgb(0 0 0 / 0.04)',
        'premium-xl': '0 16px 48px -12px rgb(0 0 0 / 0.12), 0 4px 16px -4px rgb(0 0 0 / 0.06)',
        'glow': '0 0 32px -8px rgb(166 139 101 / 0.2)',
      },
    },
  },
  plugins: []
}
