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
  'education',
  'experience',
  'skills',
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
    profileUrl: z.string().optional(),
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
        location: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        current: z.boolean().optional(),
        description: z.string(),
      }),
    ),
  }),
})

export const educationResumeModuleSchema = resumeModuleBaseSchema.extend({
  type: z.literal('education'),
  content: z.object({
    items: z.array(
      z.object({
        id: z.string().min(1),
        school: z.string(),
        degree: z.string(),
        field: z.string(),
        location: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        gpa: z.string().optional(),
        honors: z.string().optional(),
        coursework: z.string().optional(),
        description: z.string().optional(),
      }),
    ),
  }),
})

export const skillsResumeModuleSchema = resumeModuleBaseSchema.extend({
  type: z.literal('skills'),
  content: z.object({
    groups: z.array(
      z.object({
        id: z.string().min(1),
        name: z.string(),
        skills: z.array(z.string()),
      }),
    ),
  }),
})

export const customFieldTypeSchema = z.enum(['text', 'textarea', 'list'])

export const customFieldSpanSchema = z.union([
  z.literal(12),
  z.literal(6),
  z.literal(4),
])

export const customListItemSchema = z.object({
  id: z.string().min(1),
  text: z.string(),
})

const customFieldBaseSchema = z.object({
  id: z.string().min(1),
  label: z.string(),
  order: z.number().int().positive(),
  placeholder: z.string().optional(),
  span: customFieldSpanSchema,
})

export const customTextFieldSchema = customFieldBaseSchema.extend({
  type: z.literal('text'),
  value: z.string(),
})

export const customTextareaFieldSchema = customFieldBaseSchema.extend({
  type: z.literal('textarea'),
  minRows: z.number().int().positive().optional(),
  value: z.string(),
})

export const customListFieldSchema = customFieldBaseSchema.extend({
  type: z.literal('list'),
  items: z.array(customListItemSchema),
  minRows: z.number().int().positive().optional(),
})

export const customResumeFieldSchema = z.discriminatedUnion('type', [
  customTextFieldSchema,
  customTextareaFieldSchema,
  customListFieldSchema,
])

export const customResumeModuleSchema = resumeModuleBaseSchema.extend({
  type: z.literal('custom'),
  content: z.object({
    fields: z.array(customResumeFieldSchema),
  }),
})

export const resumeModuleSchema = z.discriminatedUnion('type', [
  avatarResumeModuleSchema,
  summaryResumeModuleSchema,
  educationResumeModuleSchema,
  experienceResumeModuleSchema,
  skillsResumeModuleSchema,
  customResumeModuleSchema,
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
export type EducationResumeModule = z.infer<typeof educationResumeModuleSchema>
export type SkillsResumeModule = z.infer<typeof skillsResumeModuleSchema>
export type CustomFieldType = z.infer<typeof customFieldTypeSchema>
export type CustomFieldSpan = z.infer<typeof customFieldSpanSchema>
export type CustomListItem = z.infer<typeof customListItemSchema>
export type CustomTextField = z.infer<typeof customTextFieldSchema>
export type CustomTextareaField = z.infer<typeof customTextareaFieldSchema>
export type CustomListField = z.infer<typeof customListFieldSchema>
export type CustomResumeField = z.infer<typeof customResumeFieldSchema>
export type CustomResumeModule = z.infer<typeof customResumeModuleSchema>
export type ExperienceResumeItem
  = ExperienceResumeModule['content']['items'][number]
export type EducationResumeItem
  = EducationResumeModule['content']['items'][number]
export type SkillGroup = SkillsResumeModule['content']['groups'][number]
export type ResumeModule = z.infer<typeof resumeModuleSchema>
export type ResumeModuleFor<T extends ResumeModuleType> = Extract<
  ResumeModule,
  { type: T }
>
export type ResumeScore = z.infer<typeof resumeScoreSchema>
export type ResumeDocument = z.infer<typeof resumeDocumentSchema>
