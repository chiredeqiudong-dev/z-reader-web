/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'wread-primary': '#576B95',
        'wread-text': '#333333',
        'wread-text-secondary': '#999999',
        'wread-placeholder': '#CCCCCC',
        'wread-divider': '#EEEEEE',
        'wread-bg': '#F5F5F5',
        'wread-bg-light': '#F7F7F7',
      },
      borderRadius: {
        'search': '24px',
        'tag': '16px',
        'card': '8px',
        'cover': '4px',
      },
      spacing: {
        'wread-x': '12px',
        'wread-y': '16px',
        'wread-p': '16px',
      },
    },
  },
  plugins: [],
}

