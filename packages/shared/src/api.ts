export const apiRoutes = {
  aiResume: '/api/ai/resume',
} as const

export type ApiRoute = (typeof apiRoutes)[keyof typeof apiRoutes]
