import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './lib/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        base: '#fefaf6',
        ink: '#13212b',
        brand: '#b6402c',
        accent: '#eca72c',
        pine: '#1b4332',
        'dinner-gold': '#D4AF37',
        'dinner-burgundy': '#800020',
        'dinner-charcoal': '#2C3E50',
        'dinner-cream': '#FFF8F0',
        'dinner-emerald': '#2ECC71'
      },
      boxShadow: {
        card: '0 20px 45px -25px rgba(19, 33, 43, 0.45)'
      },
      backgroundImage: {
        'hero-glow':
          'radial-gradient(circle at 20% 20%, rgba(236, 167, 44, 0.35), transparent 45%), radial-gradient(circle at 80% 0%, rgba(182, 64, 44, 0.25), transparent 35%)'
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
        confettiDrop: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(220px) rotate(360deg)', opacity: '0' }
        }
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
        float: 'float 4s ease-in-out infinite',
        gradient: 'gradient 6s ease infinite',
        confettiDrop: 'confettiDrop 1s ease-out forwards'
      }
    }
  },
  plugins: []
};

export default config;
