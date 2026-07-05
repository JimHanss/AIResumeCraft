import {
  resumeGenerationRequestSchema,
  resumeGenerationResponseSchema,
} from '@airesumecraft/shared'
import { createResumeDraft } from '../../utils/ai/providers'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const payload = resumeGenerationRequestSchema.parse(body)
  const response = await createResumeDraft(payload)
  const parsed = resumeGenerationResponseSchema.parse(response)

  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')

  return [
    parsed.summary,
    '',
    ...parsed.highlights.map(item => `- ${item}`),
  ].join('\n')
})
