/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: false,
  theme: {
    extend: {
      colors: {
        // === PREMIUM DARK BACKGROUNDS ===
        // Dark neutral for content-heavy dashboards (data visualization optimized)
        bg: {
          dark: '#0a0a0a',      // Near-black for maximum contrast
          darker: '#111111',     // Slightly lighter for depth
          muted: '#1a1a1a',      // Card/container backgrounds
          card: '#1f1f1f',       // Slightly elevated cards
          hover: '#262626',      // Interactive hover states
        },

        // === PRIMARY IDENTITY PALETTE (Forest Green) ===
        // Trust, growth, wellness, professionalism
        primary: {
          50: '#f0f7f4',         // Lightest: backgrounds, hover states
          100: '#d4ede7',        // Light: secondary backgrounds
          200: '#a0d4cb',        // Medium-light: borders, dividers
          300: '#6cbfb0',        // Medium: secondary actions
          400: '#3ca99a',        // Medium-dark: hover states
          500: '#1a8070',        // Bright accent (mid-tone)
          600: '#157359',        // Main identity color (adjusts #1a4a3a slightly)
          700: '#1a4a3a',        // **CORE PRIMARY** Forest green (trust/elevate)
          800: '#0f3129',        // Dark: text on light backgrounds
          900: '#081d18',        // Darkest: high contrast text
        },

        // === ACCENT PALETTE (Mint) ===
        // Energy, action, progress, highlights, achievement
        accent: {
          50: '#f0fdf9',         // Lightest backgrounds
          100: '#d1faf0',        // Light accent backgrounds
          200: '#a3f5e8',        // Medium-light
          300: '#7dd4a8',        // **CORE ACCENT** Mint (action/energy)
          400: '#5ec699',        // Darker mint
          500: '#3fba8a',        // Dark mint for text/icons
          600: '#2a9f78',        // Very dark mint
          700: '#1a8063',        // Darkest mint
          800: '#0d5247',        // Near-black mint tint
        },

        // === WARM ACCENT PALETTE (Energy & Dynamic) ===
        // Secondary energy, warmth, dynamic contrast against cool greens
        warm: {
          50: '#fffbf0',         // Lightest background
          100: '#fee5d0',        // Light background
          200: '#fcc89f',        // Medium-light
          300: '#f9a661',        // Medium warm
          400: '#f68c3f',        // Bright warm accent
          500: '#e87a2f',        // Energetic orange
          600: '#d45a1a',        // Deep orange (CTAs)
          700: '#b83c0a',        // Dark orange
          800: '#8a2500',        // Very dark
          900: '#5a1600',        // Darkest
        },

        // === SEMANTIC COLORS ===
        success: {
          50: '#f0fdf9',
          300: '#7dd4a8',        // Mint (matches accent)
          500: '#3fba8a',
          700: '#1a8063',
        },
        warning: {
          50: '#fffbf0',
          300: '#f9a661',        // Warm amber
          500: '#e87a2f',        // Energetic orange
          700: '#d45a1a',        // Deep orange
        },
        error: {
          50: '#fef3f2',
          300: '#f87171',        // Bright red
          500: '#e74c3c',        // Standard error red
          700: '#b91e1e',        // Dark red
        },
        info: {
          50: '#f0f9ff',
          300: '#7dd3fc',        // Sky blue
          500: '#3b82f6',        // Standard blue
          700: '#1e40af',        // Dark blue
        },

        // === NEUTRAL PALETTE ===
        // High contrast, accessible, professional
        neutral: {
          0: '#ffffff',          // Pure white
          50: '#f9fafb',         // Off-white
          100: '#f3f4f6',        // Light gray
          200: '#e5e7eb',        // Medium-light gray
          300: '#d1d5db',        // Medium gray
          400: '#9ca3af',        // Medium-dark gray
          500: '#6b7280',        // Gray text
          600: '#4b5563',        // Dark gray text
          700: '#374151',        // Darker gray
          800: '#1f2937',        // Very dark gray
          900: '#111827',        // Near-black (high contrast text)
        },

        // Legacy compatibility (kept for existing components)
        white: {
          DEFAULT: '#FFFFFF',
        },
        black: {
          DEFAULT: '#000000',
        },
        grey: {
          100: '#E5E5E5',
          200: '#8A8A8A',
          300: '#F5F5F5',
        },
        brazil: {
          green: '#1a4a3a',      // Updated to forest green
          yellow: '#f9a661',     // Updated to warm accent
          'green-dark': '#0f3129',
        },
        pt: {
          green: '#7dd4a8',      // Updated to mint
          pink: '#f9a661',       // Updated to warm accent
          grey: '#6B7280',
          orange: '#e87a2f',     // Updated to warm orange
          red: '#e74c3c',
        },
      },

      // === TYPOGRAPHY SCALE ===
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

      // === SPACING SYSTEM ===
      spacing: {
        ...Array.from({ length: 32 }, (_, i) => ({
          [i]: `${i * 4}px`,
        })).reduce((a, b) => ({ ...a, ...b }), {}),
      },

      // === SHADOW SYSTEM (Hue-shifted for sophistication) ===
      boxShadow: {
        // Subtle elevation with green-tinted shadows
        sm: '0 1px 2px 0 rgba(26, 74, 58, 0.1)',
        base: '0 2px 4px 0 rgba(26, 74, 58, 0.12)',
        md: '0 4px 8px 0 rgba(26, 74, 58, 0.14)',
        lg: '0 8px 16px 0 rgba(26, 74, 58, 0.16)',
        xl: '0 12px 24px 0 rgba(26, 74, 58, 0.18)',
        '2xl': '0 16px 32px 0 rgba(26, 74, 58, 0.2)',

        // Elevated premium shadows
        elevated: '0 8px 24px -2px rgba(26, 74, 58, 0.15), 0 4px 12px -2px rgba(0, 0, 0, 0.1)',
        premium: '0 20px 40px -4px rgba(26, 74, 58, 0.2), 0 8px 16px -2px rgba(0, 0, 0, 0.12)',

        // Interactive shadows
        focus: '0 0 0 3px rgba(125, 212, 168, 0.3)',
        hover: '0 4px 12px 0 rgba(26, 74, 58, 0.2)',
      },

      // === PREMIUM TYPOGRAPHY SYSTEM ===
      // Headers: Space Grotesk (geometric, modern, confident, premium)
      // Body: Inter (readable, warm, accessible on all screens)
      // Monospace: Space Mono (data, metrics, clean)
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],  // Headers, prominent text
        sans: ['Inter', 'system-ui', 'sans-serif'],             // Body, UI elements
        mono: ['Space Mono', 'Menlo', 'monospace'],             // Data, metrics, code
      },

      // === ANIMATION & MOTION ===
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'progress-pulse': 'progressPulse 2s ease-in-out infinite',
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
        progressPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },

      // === TRANSITION & DURATION ===
      transitionDuration: {
        fast: '150ms',
        normal: '250ms',
        slow: '350ms',
        'slower': '500ms',
      },

      // === BORDER RADIUS (Premium rounded corners) ===
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
    },
  },
  plugins: [],
};
