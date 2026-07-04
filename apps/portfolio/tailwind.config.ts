import type { Config } from 'tailwindcss'

export default {
  content: ['./app.vue', './pages/**/*.{vue,ts}', './components/**/*.{vue,ts}'],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
