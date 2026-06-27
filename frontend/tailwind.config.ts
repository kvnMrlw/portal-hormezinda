import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#2563EB',
          lightGray: '#F3F6FA',
          white: '#FFFFFF',
          navy: '#0F2447',
          green: '#2FA36B'
        }
      },
      borderRadius: {
        brand: '1.25rem'
      },
      boxShadow: {
        soft: '0 20px 60px rgba(15, 36, 71, 0.12)'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
} satisfies Config;
