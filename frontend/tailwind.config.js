export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: '#6366F1',
        secondary: '#22C55E',
        accent: '#F59E0B',
        bgDark: '#0F172A',
        bgLight: '#1E293B',
        textMain: '#E2E8F0',
        glass: 'rgba(255, 255, 255, 0.05)',
        glassLight: 'rgba(255, 255, 255, 0.1)',
        glassBorder: 'rgba(255, 255, 255, 0.1)',
      }
    },
  },
  plugins: [],
}