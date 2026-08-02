import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#2563EB',
          blueDark: '#0F3F8F',
          blueMid: '#3B82F6',
          blueLight: '#DBEAFE',
          lightGray: '#F3F6FA',
          graySoft: '#F7F9FC',
          grayMedium: '#94A3B8',
          white: '#FFFFFF',
          navy: '#0F2447',
          darkGray: '#27364A',
          green: '#2FA36B',
          yellow: '#F59E0B',
          red: '#DC2626'
        }
      },
      borderRadius: {
        brand: '1.25rem'
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        card: 'var(--shadow-card)',
        hover: 'var(--shadow-hover)'
      },
      backgroundImage: {
        'portal-surface':
          'linear-gradient(180deg, #FFFFFF 0%, #FAFBFD 100%)',
        'portal-blue': 'linear-gradient(180deg, #2F6FF0 0%, #174EA6 100%)',
        'story-ring': 'linear-gradient(135deg, #2563EB 0%, #38BDF8 42%, #2FA36B 100%)'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
} satisfies Config;
