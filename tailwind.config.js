// tailwind.config.js for Isekai Gate (database-security-sample)
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        portal: {
          DEFAULT: '#6C3FC5', // Deep purple
          light: '#A084E8',
          dark: '#3B1976',
        },
        magic: '#3B82F6', // Blue
        gold: '#FFD700',
        white: '#FFFFFF',
      },
      fontFamily: {
        fantasy: ['Geist', 'ui-sans-serif', 'system-ui'],
        accent: ['Geist_Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
