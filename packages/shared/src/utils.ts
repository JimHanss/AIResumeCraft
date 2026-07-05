import type {
  ExperienceResumeModule,
  ResumeDocument,
  ResumeModule,
  ResumeModuleFor,
  ResumeModuleType,
  ResumeSection,
} from './resume'
import { resumeDocumentSchema } from './resume'

export function uid(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

export function sortSections(sections: ResumeSection[]) {
  return [...sections].sort((left, right) => left.order - right.order)
}

export function reorderSections(sections: ResumeSection[]) {
  return sections.map((section, index) => ({
    ...section,
    order: index + 1,
  }))
}

export function sortModules(modules: ResumeModule[]) {
  return [...modules].sort((left, right) => left.order - right.order)
}

export function reorderModules(modules: ResumeModule[]) {
  return modules.map((module, index) => ({
    ...module,
    order: index + 1,
  }))
}

export function createResumeModule<T extends ResumeModuleType>(
  type: T,
): ResumeModuleFor<T> {
  const base = {
    id: uid(`module-${type}`),
    order: 1,
  }

  switch (type) {
    case 'avatar':
      return {
        ...base,
        type,
        title: 'Basic Info',
        content: {
          name: '',
          headline: '',
          email: '',
          phone: '',
          location: '',
          avatarUrl: '',
        },
      } as ResumeModuleFor<T>
    case 'summary':
      return {
        ...base,
        type,
        title: 'Summary',
        content: {
          text: '',
        },
      } as ResumeModuleFor<T>
    case 'experience':
      return {
        ...base,
        type,
        title: 'Experience',
        content: {
          items: [createExperienceItem()],
        },
      } as ResumeModuleFor<T>
    case 'skills':
      return {
        ...base,
        type,
        title: 'Skills',
        content: {
          skills: [''],
        },
      } as ResumeModuleFor<T>
  }
}

export function cloneResumeModule(module: ResumeModule) {
  const cloned = structuredClone(module)
  cloned.id = uid(`module-${module.type}`)

  if (cloned.type === 'experience') {
    cloned.content.items = cloned.content.items.map(item => ({
      ...item,
      id: uid('experience'),
    }))
  }

  return cloned
}

export function createExperienceItem(): ExperienceResumeModule['content']['items'][number] {
  return {
    id: uid('experience'),
    company: '',
    role: '',
    startDate: '',
    endDate: '',
    description: '',
  }
}

export function safeResumeDocument(input: unknown, fallback: ResumeDocument) {
  const parsed = resumeDocumentSchema.safeParse(input)
  if (parsed.success)
    return parsed.data

  return structuredClone(fallback)
}

export function calculateOverallScore(document: Pick<ResumeDocument, 'score'>) {
  const values = Object.values(document.score)
  return Math.round(
    values.reduce((total, value) => total + value, 0) / values.length,
  )
}
