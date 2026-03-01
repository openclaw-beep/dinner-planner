import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        slate: '#1e293b',
        mint: '#34d399',
        coral: '#fb7185',
        sand: '#f8fafc',
        amber: '#f59e0b'
      }
    }
  },
  plugins: []
};

export default config;
