import { apiRoutes } from '@airesumecraft/shared'
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.post(apiRoutes.aiResume, async () => {
    return HttpResponse.text(
      '建议强化量化结果，并把职责描述改写为成果导向表达。',
    )
  }),
]
