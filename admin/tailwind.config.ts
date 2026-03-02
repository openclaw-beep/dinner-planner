import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './lib/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        slate: '#1e293b',
        mint: '#34d399',
        coral: '#fb7185',
        sand: '#f8fafc',
        amber: '#f59e0b',
        'dinner-gold': '#D4AF37',
        'dinner-burgundy': '#800020',
        'dinner-charcoal': '#2C3E50',
        'dinner-cream': '#FFF8F0',
        'dinner-emerald': '#2ECC71'
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        },
        slideIn: {
          '0%': { transform: 'translate(-50%, -16px)', opacity: '0' },
          '100%': { transform: 'translate(-50%, 0)', opacity: '1' }
        },
        confettiFall: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(180px) rotate(320deg)', opacity: '0' }
        }
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
        float: 'float 4s ease-in-out infinite',
        gradient: 'gradient 6s ease infinite',
        slideIn: 'slideIn 300ms ease-out',
        confettiFall: 'confettiFall 900ms ease-out forwards'
      }
    }
  },
  plugins: []
};

export default config;
