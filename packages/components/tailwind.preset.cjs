const plugin = require('tailwindcss/plugin');

const brandPalette = {
  10: 'var(--brand-10)',
  25: 'var(--brand-25)',
  50: 'var(--brand-50)',
  75: 'var(--brand-75)',
  100: 'var(--brand-100)',
  200: 'var(--brand-200)',
  300: 'var(--brand-300)',
  400: 'var(--brand-400)',
  500: 'var(--brand-500)',
  600: 'var(--brand-600)',
  700: 'var(--brand-700)',
  800: 'var(--brand-800)',
  900: 'var(--brand-900)',
  950: 'var(--brand-950)',
};

// Keep in sync with src/utils/spacing.ts.
const spaceScale = {
  'space-1': '0.25rem', // 4px
  'space-2': '0.5rem', // 8px
  'space-3': '0.75rem', // 12px
  'space-4': '1rem', // 16px
  'space-5': '1.5rem', // 24px
  'space-6': '2rem', // 32px
  'space-7': '2.5rem', // 40px
  'space-8': '3rem', // 48px
  'space-9': '4rem', // 64px
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  darkMode: 'class',
  theme: {
    extend: {
      fontSize: {
        xxs: [
          '0.75rem', // 12px
          {
            lineHeight: '1.125rem', // 18px
          },
        ],
        xs: [
          '0.8125rem', // 13px
          {
            lineHeight: '1.125rem', // 18px
          },
        ],
        sm: [
          '0.875rem', // 14px
          {
            lineHeight: '1.25rem', // 20px
          },
        ],
        base: [
          '1rem', // 16px
          {
            lineHeight: '1.5rem', // 24px
          },
        ],
        lg: [
          '1.125rem', // 18px
          {
            lineHeight: '1.75rem', // 28px
            letterSpacing: '-0.01em', // tracking-tight
          },
        ],
        xl: [
          '1.25rem', // 20px
          {
            lineHeight: '1.875rem', // 30px
            letterSpacing: '-0.01em', // tracking-tight
          },
        ],
      },
      fontFamily: {
        mono: [
          `"Fira Code"`,
          `ui-monospace`,
          `SFMono-Regular`,
          `Menlo`,
          `Monaco`,
          `Consolas`,
          `"Liberation Mono"`,
          `"Courier New"`,
          `monospace`,
        ],
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.03em',
        snug: '-0.02em',
        normal: '0',
        wide: '0.03em',
      },
      lineHeight: {
        tight: '1.20',
      },
      backgroundImage: {
        'brand-subtle-gradient': 'var(--bg-brand-subtle-gradient)',
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      ringColor: {
        focus: 'var(--border-focus)',
      },
      boxShadow: {
        xs: '0 1px 1px 0 rgba(16, 24, 40, 0.02)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      transitionDuration: {
        fast: 'var(--duration-fast)',
        normal: 'var(--duration-normal)',
        slow: 'var(--duration-slow)',
        slower: 'var(--duration-slower)',
      },
      gap: spaceScale,
      padding: spaceScale,
      margin: spaceScale,
      space: spaceScale,
      // Gradient stops default to `colors`, so the surface tokens below —
      // which live under backgroundColor — produce no `from-*`/`to-*` utility
      // without this. A fade that ends on a surface needs to name that
      // surface, and `from-[var(--bg-surface-level-1)]` is the raw form the
      // color lint rule exists to prevent.
      gradientColorStops: {
        'text-primary': 'var(--text-primary)',
        'text-brand-primary': 'var(--text-brand-primary)',
        'text-tertiary': 'var(--text-tertiary)',
        'surface-level-1': 'var(--bg-surface-level-1)',
        'surface-level-2': 'var(--bg-surface-level-2)',
        elevated: 'var(--bg-elevated)',
      },
      backgroundColor: {
        'surface-level-1': 'var(--bg-surface-level-1)',
        'surface-level-1-hover': 'var(--bg-surface-level-1-hover)',
        'surface-level-2': 'var(--bg-surface-level-2)',
        'surface-level-2-hover': 'var(--bg-surface-level-2-hover)',
        'surface-level-3': 'var(--bg-surface-level-3)',
        'surface-level-4': 'var(--bg-surface-level-4)',
        elevated: 'var(--bg-elevated)',
        'elevated-hover': 'var(--bg-elevated-hover)',
        'elevated-selected': 'var(--bg-elevated-selected)',
        'popover-urgent': 'var(--bg-popover-urgent)',

        disabled: 'var(--bg-disabled)',

        overlay: 'var(--bg-overlay)',

        /* brand */
        brand: {
          DEFAULT: 'var(--bg-brand)',
          ...brandPalette,
        },
        'brand-hover': 'var(--bg-brand-hover)',
        'brand-subtle': 'var(--bg-brand-subtle)',
        'brand-subtle-hover': 'var(--bg-brand-subtle-hover)',
        'brand-illustration': 'var(--bg-brand-illustration)',
        'brand-muted': 'var(--bg-brand-muted)',
        'icon-brand-background': 'var(--icon-brand-background)',
        purple: 'var(--bg-purple)',

        /* intent */
        success: 'var(--bg-success)',
        'success-subtle': 'var(--bg-success-subtle)',
        'success-strong': 'var(--bg-success-strong)',
        error: 'var(--bg-error)',
        'error-subtle': 'var(--bg-error-subtle)',
        'error-strong': 'var(--bg-error-strong)',
        warning: 'var(--bg-warning)',
        'warning-subtle': 'var(--bg-warning-subtle)',
        'warning-strong': 'var(--bg-warning-strong)',

        /* control */
        'control-active': 'var(--bg-control-active)',
        'control-active-hover': 'var(--bg-control-active-hover)',
        'control-thumb': 'var(--bg-control-thumb)',
        'control-disabled': 'var(--bg-control-disabled)',

        /* selected */
        selected: 'var(--bg-selected)',
        'selected-hover': 'var(--bg-selected-hover)',

        /* data visualization */
        'chart-categorical-line-1': 'var(--chart-categorical-line-1)',
        'chart-categorical-line-2': 'var(--chart-categorical-line-2)',
        'chart-categorical-line-3': 'var(--chart-categorical-line-3)',
        'chart-categorical-line-4': 'var(--chart-categorical-line-4)',
        'chart-categorical-line-5': 'var(--chart-categorical-line-5)',
        'chart-categorical-line-6': 'var(--chart-categorical-line-6)',
        'chart-categorical-line-7': 'var(--chart-categorical-line-7)',
        'chart-categorical-line-8': 'var(--chart-categorical-line-8)',
        'chart-categorical-fill-1': 'var(--chart-categorical-fill-1)',
        'chart-categorical-fill-2': 'var(--chart-categorical-fill-2)',
        'chart-categorical-fill-3': 'var(--chart-categorical-fill-3)',
        'chart-categorical-fill-4': 'var(--chart-categorical-fill-4)',
        'chart-categorical-fill-5': 'var(--chart-categorical-fill-5)',
        'chart-categorical-fill-6': 'var(--chart-categorical-fill-6)',
        'chart-categorical-fill-7': 'var(--chart-categorical-fill-7)',
        'chart-categorical-fill-8': 'var(--chart-categorical-fill-8)',
        'table-heatmap-negative-1': 'var(--table-heatmap-negative-1)',
        'table-heatmap-negative-2': 'var(--table-heatmap-negative-2)',
        'table-heatmap-negative-3': 'var(--table-heatmap-negative-3)',
        'table-heatmap-negative-4': 'var(--table-heatmap-negative-4)',
        'table-heatmap-negative-5': 'var(--table-heatmap-negative-5)',
        'table-heatmap-neutral': 'var(--table-heatmap-neutral)',
        'table-heatmap-positive-1': 'var(--table-heatmap-positive-1)',
        'table-heatmap-positive-2': 'var(--table-heatmap-positive-2)',
        'table-heatmap-positive-3': 'var(--table-heatmap-positive-3)',
        'table-heatmap-positive-4': 'var(--table-heatmap-positive-4)',
        'table-heatmap-positive-5': 'var(--table-heatmap-positive-5)',

        primary: 'var(--bg-primary)',
        'primary-hover': 'var(--bg-primary-hover)',
        secondary: 'var(--bg-secondary)',
        'secondary-hover': 'var(--bg-secondary-hover)',
        tertiary: 'var(--bg-tertiary)',
        quaternary: 'var(--bg-quaternary)',
        'brand-primary': 'var(--bg-brand-primary)',
        'brand-primary-hover': 'var(--bg-brand-primary_hover)',
        'brand-secondary': 'var(--bg-brand-secondary)',
        'brand-secondary-hover': 'var(--bg-brand-secondary_hover)',
        'brand-tertiary': 'var(--bg-brand-tertiary)',
        'success-primary': 'var(--bg-success-primary)',
        'success-secondary': 'var(--bg-success-secondary)',
        'error-primary': 'var(--bg-error-primary)',
        'error-secondary': 'var(--bg-error-secondary)',
        'warning-primary': 'var(--bg-warning-primary)',
        'warning-secondary': 'var(--bg-warning-secondary)',
      },
      borderColor: {
        default: 'var(--border-default)',
        subtle: 'var(--border-subtle)',
        muted: 'var(--border-muted)',
        faint: 'var(--border-faint)',
        error: 'var(--border-error)',
        'error-strong': 'var(--border-error-strong)',
        brand: 'var(--border-brand)',
        'brand-strong': 'var(--border-brand-strong)',
        'brand-subtle': 'var(--border-brand-subtle)',
        'brand-disabled': 'var(--text-brand-disabled)',
        'brand-10': 'var(--brand-10)',
        'brand-25': 'var(--brand-25)',
        'brand-50': 'var(--brand-50)',
        'brand-75': 'var(--brand-75)',
        'brand-100': 'var(--brand-100)',
        'brand-200': 'var(--brand-200)',
        'brand-300': 'var(--brand-300)',
        'brand-400': 'var(--brand-400)',
        'brand-500': 'var(--brand-500)',
        'brand-600': 'var(--brand-600)',
        'brand-700': 'var(--brand-700)',
        'brand-800': 'var(--brand-800)',
        'brand-900': 'var(--brand-900)',
        'brand-950': 'var(--brand-950)',
        strong: 'var(--border-strong)',
        disabled: 'var(--border-disabled)',
        focus: 'var(--border-focus)',
        warning: 'var(--border-warning)',
        success: 'var(--border-success)',
        purple: 'var(--border-purple)',
        'status-green': 'var(--border-status-green)',
        'status-orange': 'var(--border-status-orange)',
        'status-yellow': 'var(--border-status-yellow)',
        'status-red': 'var(--border-status-red)',
        primary: 'var(--border-primary)',
        secondary: 'var(--border-secondary)',
        tertiary: 'var(--border-tertiary)',
        quaternary: 'var(--border-quaternary)',
      },
      // SVG marks cannot consume border utilities, so chart components reach
      // for the same semantic tokens through stroke.
      stroke: {
        focus: 'var(--border-focus)',
      },
      textColor: {
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        'secondary-hover': 'var(--text-secondary-hover)',
        tertiary: 'var(--text-tertiary)',
        'tertiary-hover': 'var(--text-tertiary-hover)',
        quaternary: 'var(--text-quaternary)',
        disabled: 'var(--text-disabled)',
        'error-primary': 'var(--text-error-primary)',
        'error-secondary': 'var(--text-error-secondary)',
        'error-tertiary': 'var(--text-error-tertiary)',
        'warning-primary': 'var(--text-warning-primary)',
        'warning-secondary': 'var(--text-warning-secondary)',
        'warning-tertiary': 'var(--text-warning-tertiary)',
        'success-primary': 'var(--text-success-primary)',
        'success-secondary': 'var(--text-success-secondary)',
        'success-tertiary': 'var(--text-success-tertiary)',
        placeholder: 'var(--text-placeholder)',
        'control-active-foreground': 'var(--text-control-active-foreground)',
        purple: 'var(--text-purple)',
        'brand-primary': 'var(--text-brand-primary)',
        'brand-secondary': 'var(--text-brand-secondary)',
        'brand-tertiary': 'var(--text-brand-tertiary)',
        'brand-disabled': 'var(--text-brand-disabled)',
        'brand-on-fill': 'var(--text-brand-on-fill)',
        'chart-on-color': 'var(--chart-on-color)',
        link: 'var(--text-link)',
        'link-hover': 'var(--text-link-hover)',
        'status-green': 'var(--text-status-green)',
        'status-orange': 'var(--text-status-orange)',
        'status-yellow': 'var(--text-status-yellow)',
        'status-red': 'var(--text-status-red)',
        'button-primary': 'var(--text-button-primary)',
        /* icon colors — separate namespace so icons can diverge from text */
        'icon-primary': 'var(--icon-primary)',
        'icon-secondary': 'var(--icon-secondary)',
        'icon-tertiary': 'var(--icon-tertiary)',
        'icon-disabled': 'var(--icon-disabled)',
        'icon-brand': 'var(--icon-brand)',
        'icon-brand-fill': 'var(--icon-brand-fill)',
        'icon-brand-background': 'var(--icon-brand-background)',
        'icon-error': 'var(--icon-error)',
        'icon-success': 'var(--icon-success)',
        'icon-warning': 'var(--icon-warning)',
      },
      colors: {
        'text-primary': 'var(--text-primary)',
        'text-brand-primary': 'var(--text-brand-primary)',
        'text-tertiary': 'var(--text-tertiary)',
        'surface-level-1': 'var(--bg-surface-level-1)',
        'surface-level-2': 'var(--bg-surface-level-2)',
        elevated: 'var(--bg-elevated)',
        popover: {
          DEFAULT: 'var(--bg-elevated)',
        },
        background: {
          DEFAULT: 'var(--bg-elevated)',
        },
        ls: {
          blue: 'hsl(211.5, 91.8%, 61.8%)',
          white: 'var(--white)',
          black: 'var(--black)',
          red: {
            25: 'var(--red-25)',
            50: 'var(--red-50)',
            100: 'var(--red-100)',
            200: 'var(--red-200)',
            300: 'var(--red-300)',
            400: 'var(--red-400)',
            500: 'var(--red-500)',
            600: 'var(--red-600)',
            700: 'var(--red-700)',
            800: 'var(--red-800)',
            900: 'var(--red-900)',
            950: 'var(--red-950)',
          },
          orange: {
            25: 'var(--orange-25)',
            50: 'var(--orange-50)',
            100: 'var(--orange-100)',
            200: 'var(--orange-200)',
            300: 'var(--orange-300)',
            400: 'var(--orange-400)',
            500: 'var(--orange-500)',
            600: 'var(--orange-600)',
            700: 'var(--orange-700)',
            800: 'var(--orange-800)',
            900: 'var(--orange-900)',
            950: 'var(--orange-950)',
          },
          neutral: {
            25: 'var(--neutral-25)',
            35: 'var(--neutral-35)',
            50: 'var(--neutral-50)',
            100: 'var(--neutral-100)',
            200: 'var(--neutral-200)',
            300: 'var(--neutral-300)',
            400: 'var(--neutral-400)',
            500: 'var(--neutral-500)',
            600: 'var(--neutral-600)',
            700: 'var(--neutral-700)',
            800: 'var(--neutral-800)',
            900: 'var(--neutral-900)',
            950: 'var(--neutral-950)',
          },
          green: {
            25: 'var(--green-25)',
            50: 'var(--green-50)',
            100: 'var(--green-100)',
            200: 'var(--green-200)',
            300: 'var(--green-300)',
            400: 'var(--green-400)',
            500: 'var(--green-500)',
            600: 'var(--green-600)',
            700: 'var(--green-700)',
            800: 'var(--green-800)',
            900: 'var(--green-900)',
            950: 'var(--green-950)',
          },
          acid: {
            10: 'var(--acid-10)',
            25: 'var(--acid-25)',
            50: 'var(--acid-50)',
            100: 'var(--acid-100)',
            200: 'var(--acid-200)',
            300: 'var(--acid-300)',
            400: 'var(--acid-400)',
            500: 'var(--acid-500)',
            600: 'var(--acid-600)',
            700: 'var(--acid-700)',
            800: 'var(--acid-800)',
            900: 'var(--acid-900)',
            950: 'var(--acid-950)',
          },
          purple: {
            10: 'var(--purple-10)',
            25: 'var(--purple-25)',
            50: 'var(--purple-50)',
            100: 'var(--purple-100)',
            200: 'var(--purple-200)',
            300: 'var(--purple-300)',
            400: 'var(--purple-400)',
            500: 'var(--purple-500)',
            600: 'var(--purple-600)',
            700: 'var(--purple-700)',
            800: 'var(--purple-800)',
            900: 'var(--purple-900)',
            950: 'var(--purple-950)',
          },
        },
        brand: {
          ...brandPalette,
        },
        border: {
          default: 'var(--border-default)',
          subtle: 'var(--border-subtle)',
          muted: 'var(--border-muted)',
          faint: 'var(--border-faint)',
          strong: 'var(--border-strong)',
        },
      },
      keyframes: {
        'tab-indicator-expand': {
          from: { width: '2px' },
          to: { width: '100%' },
        },
        hide: {
          from: { opacity: 1 },
          to: { opacity: 0 },
        },
        slideIn: {
          from: {
            transform: 'translateX(calc(100% + var(--viewport-padding)))',
          },
          to: { transform: 'translateX(0)' },
        },
        swipeOut: {
          from: { transform: 'translateX(var(--radix-toast-swipe-end-x))' },
          to: { transform: 'translateX(calc(100% + var(--viewport-padding)))' },
        },
        'linear-progress-indeterminate': {
          '0%, 100%': { left: '0%', width: '12.5%' },
          '25%, 75%': { width: '25%' },
          '50%': { left: '87.5%', width: '12.5%' },
        },
      },
      animation: {
        'tab-indicator-expand':
          'tab-indicator-expand var(--duration-slower) cubic-bezier(0.22, 1, 0.36, 1) both',
        hide: 'hide 100ms ease-in',
        slideIn: 'slideIn 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        swipeOut: 'swipeOut 100ms ease-out',
        'linear-progress-indeterminate':
          'linear-progress-indeterminate 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwindcss-animate'),
    plugin(({ addUtilities, addBase }) => {
      addBase({
        input: {
          borderWidth: '0',
          padding: '0',
        },
        // Global scrollbar styles for all scrollable elements
        'html, body, *': {
          'scrollbar-width': 'thin',
          'scrollbar-color': 'var(--scrollbar-thumb) transparent',
        },
        'html::-webkit-scrollbar, body::-webkit-scrollbar, *::-webkit-scrollbar':
          {
            width: '8px',
            background: 'transparent',
          },
        'html::-webkit-scrollbar-track, body::-webkit-scrollbar-track, *::-webkit-scrollbar-track':
          {
            background: 'transparent',
          },
        'html::-webkit-scrollbar-thumb, body::-webkit-scrollbar-track, *::-webkit-scrollbar-thumb':
          {
            background: 'var(--scrollbar-thumb)',
            'border-radius': '4px',
          },
        'html::-webkit-scrollbar-thumb:hover, body::-webkit-scrollbar-thumb:hover, *::-webkit-scrollbar-thumb:hover':
          {
            background: 'var(--scrollbar-thumb-hover)',
          },
      });
      addUtilities({
        '.text-security': {
          textSecurity: 'disc',
          WebkitTextSecurity: 'disc',
          MozTextSecurity: 'disc',
        },
      });

      addUtilities({
        '.button-primary-foreground': {
          color: 'var(--button-primary-foreground)',
        },
        '.button-primary-foreground-hover': {
          color: 'var(--button-primary-foreground-hover)',
        },
        '.button-primary-bg': { backgroundColor: 'var(--button-primary-bg)' },
        '.button-primary-bg-hover': {
          backgroundColor: 'var(--button-primary-bg-hover)',
        },
        '.button-primary-border': {
          borderColor: 'var(--button-primary-border)',
        },
        '.button-primary-border-hover': {
          borderColor: 'var(--button-primary-border-hover)',
        },
        '.button-primary-underlined-foreground': {
          color: 'var(--button-primary-underlined-foreground)',
        },
        '.button-primary-underlined-foreground-hover': {
          color: 'var(--button-primary-underlined-foreground-hover)',
        },
        '.button-primary-underlined-border': {
          borderColor: 'var(--button-primary-underlined-border)',
        },
        '.button-primary-underlined-border-hover': {
          borderColor: 'var(--button-primary-underlined-border-hover)',
        },

        '.button-primary-error-foreground': {
          color: 'var(--button-primary-error-foreground)',
        },
        '.button-primary-error-foreground-hover': {
          color: 'var(--button-primary-error-foreground-hover)',
        },
        '.button-primary-error-bg': {
          backgroundColor: 'var(--button-primary-error-bg)',
        },
        '.button-primary-error-bg-hover': {
          backgroundColor: 'var(--button-primary-error-bg-hover)',
        },
        '.button-primary-error-border': {
          borderColor: 'var(--button-primary-error-border)',
        },
        '.button-primary-error-border-hover': {
          borderColor: 'var(--button-primary-error-border-hover)',
        },

        '.button-secondary-foreground': {
          color: 'var(--button-secondary-foreground)',
        },
        '.button-secondary-foreground-hover': {
          color: 'var(--button-secondary-foreground-hover)',
        },
        '.button-secondary-bg': {
          backgroundColor: 'var(--button-secondary-bg)',
        },
        '.button-secondary-bg-hover': {
          backgroundColor: 'var(--button-secondary-bg-hover)',
        },
        '.button-secondary-border': {
          borderColor: 'var(--button-secondary-border)',
        },
        '.button-secondary-border-hover': {
          borderColor: 'var(--button-secondary-border-hover)',
        },
        '.button-secondary-underlined-border': {
          borderColor: 'var(--button-secondary-underlined-border)',
        },
        '.button-secondary-underlined-border-hover': {
          borderColor: 'var(--button-secondary-underlined-border-hover)',
        },

        '.button-secondary-color-foreground': {
          color: 'var(--button-secondary-color-foreground)',
        },
        '.button-secondary-color-foreground-hover': {
          color: 'var(--button-secondary-color-foreground-hover)',
        },
        '.button-secondary-color-bg': {
          backgroundColor: 'var(--button-secondary-color-bg)',
        },
        '.button-secondary-color-bg-hover': {
          backgroundColor: 'var(--button-secondary-color-bg-hover)',
        },
        '.button-secondary-color-border': {
          borderColor: 'var(--button-secondary-color-border)',
        },
        '.button-secondary-color-border-hover': {
          borderColor: 'var(--button-secondary-color-border-hover)',
        },

        '.button-error-underlined-foreground-hover': {
          color: 'var(--button-error-underlined-foreground-hover)',
        },
        '.button-error-underlined-border': {
          borderColor: 'var(--button-error-underlined-border)',
        },
        '.button-error-underlined-border-hover': {
          borderColor: 'var(--button-error-underlined-border-hover)',
        },
        '.button-error-disabled-foreground': {
          color: 'var(--button-error-disabled-foreground)',
        },
        '.button-error-disabled-border': {
          borderColor: 'var(--button-error-disabled-border)',
        },
      });

      addUtilities({
        '.display-sm': {
          fontSize: '1rem', // 16px
          lineHeight: '1.5rem', // 24px
          fontWeight: '600', // semibold
        },
        '.display-base': {
          fontSize: '1.5rem', // 24px
          lineHeight: '2rem', // 32px
          letterSpacing: '-0.01em', // tracking-tight
        },
        '.display-lg': {
          fontSize: '1.875rem', // 30px
          lineHeight: '2.375rem', // 38px
          letterSpacing: '-0.01em', // tracking-tight
        },
        '.display-xl': {
          fontSize: '2.25rem', // 36px
          lineHeight: '2.75rem', // 44px
          letterSpacing: '-0.01em', // tracking-tight
        },
        '.display-2xl': {
          fontSize: '3rem', // 48px
          lineHeight: '3.75rem', // 60px
          letterSpacing: '-0.01em', // tracking-tight
        },
        '.caps-label-sm': {
          fontSize: '0.875rem', // 14px
          lineHeight: '1.25rem', // 20px
          letterSpacing: '0.02625rem', // 0.42px
          textTransform: 'uppercase',
        },
        '.caps-label-xs': {
          fontSize: '0.75rem', // 14px
          lineHeight: '1.125rem', // 20px
          letterSpacing: '0.0225rem', // 0.42px
          textTransform: 'uppercase',
        },
      });
    }),
  ],
};
