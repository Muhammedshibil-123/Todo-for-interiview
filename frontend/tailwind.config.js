/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090B', // Zinc 950
        surface: '#18181B', // Zinc 900
        surfaceHover: '#27272A', // Zinc 800
        primary: '#3B82F6', // Professional crisp blue
        primaryHover: '#2563EB',
        border: '#27272A', // Zinc 800
        textMain: '#FAFAFA', // Zinc 50
        textMuted: '#A1A1AA', // Zinc 400
        danger: '#F87171',
        success: '#34D399',
        warning: '#FBBF24',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
