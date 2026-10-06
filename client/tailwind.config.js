export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fca5a5',
          300: '#f87171',
          400: '#ef4444',
          500: '#dc2626',
          600: '#b91c1c',
          700: '#991b1b',
          800: '#7f1d1d',
          900: '#450a0a',
          950: '#2b0404',
        },
        dark: {
          bg: '#09090b',
          card: '#121215',
          border: '#27272a',
          hover: '#18181b',
        },
      },
    },
  },
  plugins: [],
};
