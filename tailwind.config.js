/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fff1f0',
          100: '#ffdedd',
          200: '#ffbdbb',
          300: '#ff8b87',
          400: '#ff5046',
          500: '#f72b20',
          600: '#e41008',
          700: '#c00c05',
          800: '#9e0f09',
          900: '#83140f',
          950: '#460503',
        },
        dark: {
          950: '#080808',
          900: '#0f0f0f',
          800: '#161616',
          700: '#1e1e1e',
          600: '#2a2a2a',
          500: '#3a3a3a',
          400: '#555555',
          300: '#888888',
          200: '#aaaaaa',
          100: '#cccccc',
        }
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"DM Mono"', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'fade-in':     'fadeIn 0.4s ease forwards',
        'slide-up':    'slideUp 0.5s ease forwards',
        'shimmer':     'shimmer 1.5s infinite',
        'pulse-brand': 'pulseBrand 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:     { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:    { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        shimmer:    { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        pulseBrand: { '0%,100%': { boxShadow: '0 0 0 0 rgba(247,43,32,0.4)' }, '50%': { boxShadow: '0 0 0 8px rgba(247,43,32,0)' } },
      }
    }
  },
  plugins: []
}
