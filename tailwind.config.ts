import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'game-bg': '#1a1a2e',
        'panel-bg': '#16213e',
        'accent': '#0f3460',
        'highlight': '#e94560',
      },
    },
  },
  plugins: [],
}

export default config
