import { apiRoutes, demoResume } from '@airesumecraft/shared'
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get(apiRoutes.demoResume, () => {
    return HttpResponse.json(demoResume)
  }),
  http.post(apiRoutes.aiResume, async () => {
    return HttpResponse.text(
      'Improve quantified impact and rewrite responsibilities as outcomes.',
    )
  }),
]
