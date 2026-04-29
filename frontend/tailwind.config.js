/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // === BRAZILFIT DARK BACKGROUNDS ===
        bg: {
          dark: '#0f0f0f',
          darker: '#0a0a0a',
          muted: '#1a1a1a',
          card: '#1a1a1a',
          hover: '#242424',
        },

        // === BRAND COLORS ===
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#4CAF50',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },

        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#FF6B2B',
          400: '#FF8C55',
          500: '#ea580c',
          600: '#c2410c',
          700: '#9a3412',
        },

        yellow: {
          300: '#FFD600',
          400: '#FFE033',
          500: '#eab308',
        },

        // === SEMANTIC ===
        success: { 500: '#4CAF50' },
        warning: { 500: '#FF6B2B' },
        error: { 500: '#ef4444' },
        info: { 500: '#3b82f6' },

        // === NEUTRALS (dark-first) ===
        neutral: {
          0: '#ffffff',
          50: '#0f0f0f',
          100: '#1a1a1a',
          200: '#242424',
          300: '#2e2e2e',
          400: '#404040',
          500: '#606060',
          600: '#a0a0a0',
          700: '#c0c0c0',
          800: '#e0e0e0',
          900: '#ffffff',
        },

        // === LEGACY COMPAT ===
        white: { DEFAULT: '#FFFFFF' },
        black: { DEFAULT: '#000000' },
        grey: {
          100: '#2e2e2e',
          200: '#606060',
          300: '#1a1a1a',
        },
        brazil: {
          green: '#4CAF50',
          yellow: '#FFD600',
          'green-dark': '#388E3C',
        },
        pt: {
          green: '#4CAF50',
          pink: '#FF6B2B',
          grey: '#606060',
          orange: '#FF6B2B',
          red: '#ef4444',
        },
      },

      // === TYPOGRAPHY ===
      fontSize: {
        xs: ['12px', { lineHeight: '1.5' }],
        sm: ['14px', { lineHeight: '1.5' }],
        base: ['16px', { lineHeight: '1.6' }],
        lg: ['18px', { lineHeight: '1.6' }],
        xl: ['20px', { lineHeight: '1.7' }],
        '2xl': ['24px', { lineHeight: '1.7' }],
        '3xl': ['30px', { lineHeight: '1.8' }],
        '4xl': ['36px', { lineHeight: '1.8' }],
        '5xl': ['48px', { lineHeight: '1.9' }],
      },

      fontFamily: {
        display: ['Clash Display', 'system-ui', 'sans-serif'],
        sans: ['Satoshi', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'Menlo', 'monospace'],
      },

      // === SHADOWS (dark-optimized) ===
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0,0,0,0.4)',
        base: '0 2px 4px 0 rgba(0,0,0,0.4)',
        md: '0 4px 8px 0 rgba(0,0,0,0.5)',
        lg: '0 8px 16px 0 rgba(0,0,0,0.5)',
        xl: '0 12px 24px 0 rgba(0,0,0,0.6)',
        '2xl': '0 16px 32px 0 rgba(0,0,0,0.6)',
        elevated: '0 8px 24px -2px rgba(0,0,0,0.5)',
        premium: '0 20px 40px -4px rgba(0,0,0,0.6)',
        focus: '0 0 0 3px rgba(76,175,80,0.3)',
        hover: '0 4px 12px 0 rgba(76,175,80,0.2)',
        green: '0 4px 20px rgba(76,175,80,0.25)',
        orange: '0 4px 20px rgba(255,107,43,0.25)',
      },

      // === BORDER RADIUS ===
      borderRadius: {
        xs: '2px',
        sm: '4px',
        base: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '32px',
      },

      // === ANIMATIONS ===
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeInUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },

      transitionDuration: {
        fast: '150ms',
        normal: '250ms',
        slow: '350ms',
        slower: '500ms',
      },
    },
  },
  plugins: [],
};
