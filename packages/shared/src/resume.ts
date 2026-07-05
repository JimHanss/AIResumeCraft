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

export const resumeModuleTypeSchema = z.enum([
  'avatar',
  'summary',
  'experience',
  'skills',
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

const resumeModuleBaseSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  order: z.number().int().positive(),
})

export const avatarResumeModuleSchema = resumeModuleBaseSchema.extend({
  type: z.literal('avatar'),
  content: z.object({
    name: z.string(),
    headline: z.string(),
    email: z.string(),
    phone: z.string().optional(),
    location: z.string().optional(),
    avatarUrl: z.string().optional(),
  }),
})

export const summaryResumeModuleSchema = resumeModuleBaseSchema.extend({
  type: z.literal('summary'),
  content: z.object({
    text: z.string(),
  }),
})

export const experienceResumeModuleSchema = resumeModuleBaseSchema.extend({
  type: z.literal('experience'),
  content: z.object({
    items: z.array(
      z.object({
        id: z.string().min(1),
        company: z.string(),
        role: z.string(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        description: z.string(),
      }),
    ),
  }),
})

export const skillsResumeModuleSchema = resumeModuleBaseSchema.extend({
  type: z.literal('skills'),
  content: z.object({
    skills: z.array(z.string()),
  }),
})

export const resumeModuleSchema = z.discriminatedUnion('type', [
  avatarResumeModuleSchema,
  summaryResumeModuleSchema,
  experienceResumeModuleSchema,
  skillsResumeModuleSchema,
])

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
  modules: z.array(resumeModuleSchema),
  sections: z.array(resumeSectionSchema),
  score: resumeScoreSchema,
})

export type ResumeLocale = z.infer<typeof resumeLocaleSchema>
export type ResumeSectionType = z.infer<typeof resumeSectionTypeSchema>
export type ResumeModuleType = z.infer<typeof resumeModuleTypeSchema>
export type ResumeProfile = z.infer<typeof resumeProfileSchema>
export type ResumeSection = z.infer<typeof resumeSectionSchema>
export type AvatarResumeModule = z.infer<typeof avatarResumeModuleSchema>
export type SummaryResumeModule = z.infer<typeof summaryResumeModuleSchema>
export type ExperienceResumeModule = z.infer<
  typeof experienceResumeModuleSchema
>
export type SkillsResumeModule = z.infer<typeof skillsResumeModuleSchema>
export type ResumeModule = z.infer<typeof resumeModuleSchema>
export type ResumeModuleFor<T extends ResumeModuleType> = Extract<
  ResumeModule,
  { type: T }
>
export type ResumeScore = z.infer<typeof resumeScoreSchema>
export type ResumeDocument = z.infer<typeof resumeDocumentSchema>
