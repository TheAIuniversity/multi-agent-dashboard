/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'claude-bg': '#1a1a1a',
        'claude-surface': '#262626',
        'claude-border': '#404040',
        'claude-text': '#e5e5e5',
        'claude-muted': '#a3a3a3',
        'claude-accent': '#D97757',
        'claude-danger': '#ef4444',
        'claude-warning': '#f59e0b',
      }
    },
  },
  plugins: [],
}