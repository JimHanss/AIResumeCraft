import type { ResumeDocument } from '@airesumecraft/shared'
import { apiRoutes } from '@airesumecraft/shared'
import { apiClient } from './client'

export async function getDemoResume() {
  const response = await apiClient.get<ResumeDocument>(apiRoutes.demoResume)
  return response.data
}
