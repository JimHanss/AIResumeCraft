import { z } from 'zod'

export const resumeLocaleSchema = z.enum(['zh-CN', 'en-US'])

export const resumeSectionTypeSchema = z.enum([
  'summary',
  'experience',
  'education',
  'projects',
  'skills',
  'awards',
  'custom',
])

export const resumeProfileSchema = z.object({
  name: z.string().min(1),
  headline: z.string().min(1),
  email: z.string().email(),
  location: z.string().min(1),
})

export const resumeSectionSchema = z.object({
  id: z.string().min(1),
  type: resumeSectionTypeSchema,
  title: z.string().min(1),
  markdown: z.string(),
  order: z.number().int().positive(),
})

export const resumeScoreSchema = z.object({
  impact: z.number().min(0).max(100),
  clarity: z.number().min(0).max(100),
  relevance: z.number().min(0).max(100),
  ats: z.number().min(0).max(100),
})

export const resumeDocumentSchema = z.object({
  id: z.string().min(1),
  locale: resumeLocaleSchema,
  profile: resumeProfileSchema,
  sections: z.array(resumeSectionSchema),
  score: resumeScoreSchema,
})

export type ResumeLocale = z.infer<typeof resumeLocaleSchema>
export type ResumeSectionType = z.infer<typeof resumeSectionTypeSchema>
export type ResumeProfile = z.infer<typeof resumeProfileSchema>
export type ResumeSection = z.infer<typeof resumeSectionSchema>
export type ResumeScore = z.infer<typeof resumeScoreSchema>
export type ResumeDocument = z.infer<typeof resumeDocumentSchema>
