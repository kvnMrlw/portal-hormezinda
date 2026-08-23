import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#4A7FA7',
          blueDark: '#1A3D63',
          blueMid: '#6F9FBE',
          blueLight: '#B3CFE5',
          lightGray: '#F6FAFD',
          graySoft: '#EEF5F9',
          grayMedium: '#73879A',
          white: '#FFFFFF',
          navy: '#0A1931',
          darkGray: '#31465A',
          green: '#2F9D78',
          yellow: '#D9963A',
          red: '#C84D5A'
        }
      },
      borderRadius: { brand: '1.25rem' },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        card: 'var(--shadow-card)',
        hover: 'var(--shadow-hover)'
      },
      backgroundImage: {
        'portal-surface': 'linear-gradient(180deg, rgba(255,255,255,.97) 0%, rgba(246,250,253,.96) 100%)',
        'portal-blue': 'linear-gradient(135deg, #1A3D63 0%, #4A7FA7 100%)',
        'portal-deep': 'linear-gradient(145deg, #07182B 0%, #0A1931 42%, #1A3D63 100%)',
        'story-ring': 'linear-gradient(135deg, #1A3D63 0%, #4A7FA7 48%, #2F9D78 100%)'
      },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] }
    }
  },
  plugins: []
} satisfies Config;
