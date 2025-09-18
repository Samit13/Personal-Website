import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0b0c0f',
        fg: '#e6e7eb',
        muted: '#9aa0a6',
        glass: 'rgba(255,255,255,0.06)'
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', 'SF Pro Text', 'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji']
      },
      boxShadow: {
        glass: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 30px rgba(0,0,0,0.35)'
      },
      backgroundImage: {
        'radial-faint': 'radial-gradient(1000px 600px at 50% -20%, rgba(255,255,255,0.08), transparent)',
        'gloss': 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.04) 60%, rgba(255,255,255,0) 100%)'
      }
    }
  },
  plugins: []
}

export default config
