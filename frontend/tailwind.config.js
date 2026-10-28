/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: '#f4f6f9',
        surface: '#ffffff',
        'surface-2': '#f1f4f8',
        fill: '#eef1f5',
        'fill-panel': '#e6eaf0',
        line: '#eef1f5',
        'line-2': '#e6eaf0',
        ink: '#0f1722',
        'ink-2': '#5b6574',
        'ink-3': '#7a8494',
        'ink-4': '#9aa3b2',
        nav: '#0c111a',
        // Primary blue
        blue: {
          DEFAULT: '#2b6ef2',
          hover: '#1f5ee0',
          tint: '#e8f0fe',
          ring: '#cddcfd',
          dash: '#b8cdf8',
          deep: '#1d4fb8',
          active: '#6ea0ff',
          'active-bg': 'rgba(110,160,255,0.18)',
        },
        // Secondary teal
        teal: {
          DEFAULT: '#0fa390',
          tint: '#dff5f0',
          text: '#0b7f70',
          ring: '#bfe9e0',
        },
        // Accent violet
        violet: {
          DEFAULT: '#7a5af5',
          tint: '#efeafe',
          text: '#5b3fd1',
        },
        // Accent amber
        amber: {
          DEFAULT: '#e59a1a',
          tint: '#fdf1dc',
          text: '#a2620a',
        },
        // Map
        'map-ink': '#3b4657',
        'map-konkan': '#9aa3b2',
        'toggle-off': '#d5dbe4',
        'pass-stop': '#c3cad6',
      },
      borderRadius: {
        phone: '50px',
        bezel: '60px',
        sheet: '30px',
        card: '20px',
        'card-lg': '24px',
        btn: '16px',
        badge: '11px',
        code: '8px',
        seg: '14px',
        'seg-thumb': '11px',
      },
      boxShadow: {
        search: '0 8px 24px rgba(15,23,34,.10)',
        'map-btn': '0 6px 18px rgba(15,23,34,.12)',
        sheet: '0 -8px 32px rgba(15,23,34,.14)',
        layers: '0 16px 40px rgba(15,23,34,.18)',
        nav: '0 12px 32px rgba(12,17,26,.35)',
        card: '0 2px 10px rgba(15,23,34,.05)',
        'seg-thumb': '0 1px 4px rgba(15,23,34,.12)',
      },
      fontSize: {
        'panel-title': ['32px', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '700' }],
        'sheet-title': ['23px', { lineHeight: '1.2', letterSpacing: '-0.025em', fontWeight: '700' }],
        'big-time': ['22px', { letterSpacing: '-0.02em', fontWeight: '700' }],
        'section-header': ['17px', { letterSpacing: '-0.01em', fontWeight: '700' }],
        'row-title': ['15px', { letterSpacing: '-0.01em', fontWeight: '600' }],
        kicker: ['13px', { fontWeight: '600' }],
        badge: ['11px', { fontWeight: '700' }],
      },
    },
  },
  plugins: [],
}
