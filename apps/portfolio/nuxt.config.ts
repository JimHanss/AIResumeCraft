import process from 'node:process'

export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],
  ssr: true,
  devtools: { enabled: true },
  css: ['~/assets/css/tailwind.css'],
  build: {
    transpile: ['@airesumecraft/shared'],
  },
  nitro: {
    prerender: {
      routes: ['/', '/resume/demo'],
    },
  },
  routeRules: {
    '/': { prerender: true },
    '/resume/**': { prerender: true },
    '/api/**': {
      cors: true,
      prerender: false,
    },
  },
  runtimeConfig: {
    aiProvider: process.env.NUXT_AI_PROVIDER ?? 'mock',
    openaiApiKey: process.env.NUXT_OPENAI_API_KEY ?? '',
    deepseekApiKey: process.env.NUXT_DEEPSEEK_API_KEY ?? '',
    moonshotApiKey: process.env.NUXT_MOONSHOT_API_KEY ?? '',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
    },
  },
  typescript: {
    strict: true,
    typeCheck: true,
  },
})
