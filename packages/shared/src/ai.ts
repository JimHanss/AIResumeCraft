import { z } from 'zod'

export const aiProviderNameSchema = z.enum([
  'mock',
  'openai',
  'deepseek',
  'moonshot',
])

export type AIProviderName = z.infer<typeof aiProviderNameSchema>

export const resumeGenerationRequestSchema = z.object({
  provider: aiProviderNameSchema.default('mock'),
  targetRole: z.string().min(2).max(120),
  language: z.enum(['zh-CN', 'en-US']).default('zh-CN'),
  sourceMarkdown: z.string().max(12000).optional(),
})

export type ResumeGenerationRequest = z.infer<
  typeof resumeGenerationRequestSchema
>

export const resumeGenerationResponseSchema = z.object({
  summary: z.string(),
  highlights: z.array(z.string()).min(1),
  sections: z.array(
    z.object({
      title: z.string(),
      markdown: z.string(),
    }),
  ),
  score: z.object({
    impact: z.number().min(0).max(100),
    clarity: z.number().min(0).max(100),
    relevance: z.number().min(0).max(100),
    ats: z.number().min(0).max(100),
  }),
})

export type ResumeGenerationResponse = z.infer<
  typeof resumeGenerationResponseSchema
>
