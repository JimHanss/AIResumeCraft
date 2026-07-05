export const apiRoutes = {
  aiResume: '/api/ai/resume',
  demoResume: '/api/resume/demo',
} as const

export type ApiRoute = (typeof apiRoutes)[keyof typeof apiRoutes]
